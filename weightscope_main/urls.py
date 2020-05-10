from django.conf.urls import include, url
from rest_framework import routers
from .api import FriendViewSet,  NotificationViewSet, WeightViewSet, UserAPI, RetrieveUserAPI
from django.views.decorators.csrf import csrf_exempt

router = routers.DefaultRouter()
router.register('weights', WeightViewSet, 'weights')
router.register('notifications', NotificationViewSet, 'notifications')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'^auth/user-info/$', RetrieveUserAPI.as_view()),
    url(r'^auth/admin-delete', UserAPI.as_view({'post': 'delete_all'})),
    url(r'^auth/register/$', UserAPI.as_view({'post': 'register'})),
    url(r'^auth/login/$', UserAPI.as_view({'post': 'login'})),
    url(r'^auth/update-user/$', UserAPI.as_view({'patch': 'partial_update'})),
    url(r'^auth/confirm-registration/$',
        UserAPI.as_view({'post': 'confirm_registration'})),
    url(r'^auth/forgot-password/$',
        UserAPI.as_view({'post': 'forgot_password'})),
    url(r'^auth/confirm-password-reset/$',
        UserAPI.as_view({'post': 'confirm_password_reset'})),
    url(r'^auth/update-password/$',
        UserAPI.as_view({'post': 'update_password'})),
    url(r'^auth/get-friend-code/$',
        FriendViewSet.as_view({'get': 'get_friend_code'})),
    url(r'^auth/send-friend-code/$',
        FriendViewSet.as_view({'post': 'create'}))
]
