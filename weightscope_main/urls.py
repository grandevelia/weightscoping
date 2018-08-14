from django.conf.urls import include, url
from rest_framework import routers
from .api import RegistrationAPI, ConfirmationAPI, LoginAPI, UserAPI, WeightViewSet, UpdateUserAPI

router = routers.DefaultRouter()
router.register('weights', WeightViewSet, 'weights')

urlpatterns = [
	url(r'^', include(router.urls)),
	url(r'^auth/register/$', RegistrationAPI.as_view()),
	url(r'^auth/login/$', LoginAPI.as_view()),
	url(r'^auth/update_user/$', UpdateUserAPI.as_view()),
	url(r'^auth/user/$', UserAPI.as_view()),
	url(r'^auth/confirm/$', ConfirmationAPI.as_view()),
]