from django.conf.urls import url, include
from django.contrib import admin
from django.views.generic import TemplateView
from weightscope_main import urls
from knox import views as knox_views

urlpatterns = [
    url(r'^api/', include(urls)),
    url(r'^api/auth/logout', knox_views.LogoutView.as_view(), name='knox_logout'),
    url(r'^api/auth/', include('knox.urls')),
    url(r'^', TemplateView.as_view(template_name="index.html")),
]