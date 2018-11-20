from django.conf.urls import include, url
from rest_framework import routers
#from .api import NotificationViewSet, RegistrationAPI, ConfirmationAPI, LoginAPI, UserAPI, WeightViewSet, UpdateUserAPI, ResetPasswordAPI, ConfirmResetAPI, UpdatePasswordAPI
from .api import NotificationViewSet, WeightViewSet, UserAPI, RetrieveUserAPI

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
	url(r'^auth/confirm-registration/$', UserAPI.as_view({'post': 'confirm_registration'})),
	url(r'^auth/forgot-password/$', UserAPI.as_view({'post': 'forgot_password'})),
	url(r'^auth/confirm-password-reset/$', UserAPI.as_view({'post': 'confirm_password_reset'})),
	url(r'^auth/update-password/$', UserAPI.as_view({'post': 'update_password'})),
	url(r'^weights/$', WeightViewSet.as_view({'put': 'update', 'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'})),
]
'''urlpatterns = [
	url(r'^', include(router.urls)),
	url(r'^auth/register/$', RegistrationAPI.as_view()),
	url(r'^auth/login/$', LoginAPI.as_view()),
	url(r'^auth/update_user/$', UpdateUserAPI.as_view()),
	url(r'^auth/user/$', UserAPI.as_view()),
	url(r'^auth/confirm/$', ConfirmationAPI.as_view()),
	url(r'^auth/reset_password/$', ResetPasswordAPI.as_view()),
	url(r'^auth/confirm_reset/$', ConfirmResetAPI.as_view()),
	url(r'^auth/update_password/$', UpdatePasswordAPI.as_view()),
	#url(r'^weights/$', WeightViewSet.as_view({'put': 'update', 'get': 'retrieve', 'patch': 'partial_update', 'delete': 'destroy'})),
]'''