# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APITestCase, force_authenticate, APIRequestFactory
from rest_framework.authtoken.models import Token
from .models import Profile, Friend
from .api import UserAPI, FriendViewSet, RetrieveUserAPI
from knox.models import AuthToken

import hashlib
import json
import random


def get_general_profile():
    general_profile = {
        'email': 'UnitTest@theseusllc.co',
        'password': 'unittestpassword',
        'alcohol': True,
        'carb_ranks': [0, 1, 2, 3, 4, 5, 6, 7, 8],
        'weight_units': 'Pounds',
        'height_units': 'Feet / Inches',
        'height_inches': 72,
        'ideal_weight_kg': 71,
        'monetary_value': 0,
        'amount_paid': 0,
        'sex': 'male',
        'payment_option': 1,
        'starting_weight': 81,
    }
    return general_profile.copy()


def make_profile(profile=get_general_profile(), random_email=False):
    if random_email:
        email = hashlib.sha1(str(random.random()).encode('utf-8')).hexdigest()
        profile['email'] = "{0}@theseusllc.co".format(email)

    out = Profile.objects.create(**profile)
    out.set_password(profile['password'])
    out.save()
    return(out)


class ProfileTestCase(APITestCase):
    def setUp(self):
        self.c = APIRequestFactory()

    def test_registration_endpoint(self):
        my_profile = get_general_profile()
        my_profile['weight_kg'] = my_profile['starting_weight']
        del my_profile['starting_weight']
        out = self.c.post(
            "/api/auth/register", json.dumps(my_profile), content_type='application/json')
        view = UserAPI.as_view({'post': 'register'})
        test = view(out, format='json')
        self.assertEqual(test.status_code, 200)

    def test_get_user(self):
        profile = make_profile()
        token = AuthToken.objects.create(profile)
        req = self.c.get(
            "/api/auth/user-info", content_type='application/json')
        force_authenticate(req, user=profile, token=token)
        view = RetrieveUserAPI.as_view()
        test = view(req)


class FriendTestCase(APITestCase):
    def setUp(self):
        self.c = APIRequestFactory()
        self.profile = make_profile()
        self.token = AuthToken.objects.create(self.profile)

    def make_friend_request(self, friend_email, creator, token, method=False):
        req = self.c.post("/api/friends", json.dumps({'friend': friend_email, 'method': method}),
                          content_type='application/json')

        force_authenticate(req, user=creator, token=token)
        view = FriendViewSet.as_view({'post': 'create'})
        return(view(req))

    def make_friend(self, **kwargs):
        friend_data = {}
        if 'creator' not in kwargs:
            friend_data['creator'] = self.profile
        else:
            friend_data['creator'] = kwargs['creator']

        if 'created' not in kwargs:
            friend_data['created'] = timezone.now()
        else:
            #print(kwargs['created'], kwargs['friend'], kwargs['creator'])
            friend_data['created'] = kwargs['created']

        if 'friend_activation_key' not in kwargs:
            salt = hashlib.sha1(
                str(random.random()).encode('utf-8')).hexdigest()[:5]
            salt = salt + str(friend_data['creator']) + \
                str(friend_data['created'])
            friend_data['friend_activation_key'] = hashlib.sha1(
                salt.encode('utf-8')).hexdigest()
        else:
            friend_data['friend_activation_key'] = kwargs['friend_activation_key']

        if 'friend' not in kwargs:
            friend_email = hashlib.sha1(
                str(random.random()).encode('utf-8')).hexdigest()
            friend_data['friend'] = "{0}@testfriend.com".format(friend_email)
        else:
            friend_data['friend'] = kwargs['friend']

        out = Friend.objects.create(**friend_data)
        out.save()
        return(out)

    def test_friend_create_request(self):
        """
            Request to invite friend creates an inactive profile
            and correctly formatted email invitation
        """
        test = self.make_friend_request(
            "testfriend@testfriend.com", self.profile, self.token)
        self.assertEqual(test.status_code, 201)

    def test_one_invite_only(self):
        """Request from same creator to invite friend with email already invited fails"""
        new_email = "friend1@testfriend.com"
        test1 = self.make_friend_request(new_email, self.profile, self.token)
        test2 = self.make_friend_request(new_email, self.profile, self.token)
        self.assertEqual(test2.status_code, 400)

    def test_multiple_creators_ok(self):
        """Request to invite same email from multiple creators succeeds"""
        second_creator = make_profile(random_email=True)
        second_token = AuthToken.objects.create(second_creator)

        new_email = "friend2@testfriend.com"
        test1 = self.make_friend_request(new_email, self.profile, self.token)
        test2 = self.make_friend_request(
            new_email, second_creator, second_token)

        self.assertEqual(test2.status_code, 201)

    def test_expired_friend_inviteable(self):
        """Creators can invite same email after 10 days"""
        friend = self.make_friend()
        Friend.objects.filter(id=friend.id).update(
            created=timezone.now()-timedelta(days=11))
        test = self.make_friend_request(
            friend.friend, self.profile, self.token)
        self.assertEqual(test.status_code, 201)

    def test_registered_uninviteable(self):
        """Invited friends who register can no longer be invited"""
        friend_profile = make_profile(random_email=True)
        test = self.make_friend_request(
            friend_profile.email, self.profile, self.token)
        self.assertEqual(test.status_code, 400)

    def test_n_invites_below_available(self):
        """Users cannot send out more invites than they have available"""
        for i in range(self.profile.available_invites + 1):
            friend = self.make_friend()
            test = self.make_friend_request(
                friend.email, self.profile, self.token)
        self.assertEqual(test.status_code, 400)

    def test_expired_not_counted(self):
        """Users can send out requests when previous invites expire"""
        '''for i in range(self.profile.available_invites + 1):
            friend = self.make_friend()
            Friend.objects.filter(id=friend.id).update(
                created=timezone.now()-timedelta(days=11))

        friend = self.make_friend()
        test = self.make_friend_request(friend.email, self.profile, self.token)
        self.assertEqual(test.status_code, 201)'''
        pass

    def test_accepted_adds_available(self):
        """Requests that result in new account creation add an available invite slot for creator"""
        pass

    def test_accepted_adds_points(self):
        pass
