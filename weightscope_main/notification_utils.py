from django.conf import settings

from django.core.mail import send_mail
from django.template.loader import render_to_string
BASE = getattr(settings, "BASE_DIR", None)
EMAIL_BASE = getattr(settings, "EMAIL_BASE", None)

def send_email(data):
    link = data['activation_key']
    c = {'key': link, 'basename': EMAIL_BASE}
    c = merge_two_dicts(c, data)

    subject = data['email_subject']
    from_email = "no-reply@reductiscope.com"
    to_email = data['email']

    msg_txt = render_to_string(BASE + "/templates/" + data['email_path'] + ".txt", c)
    msg_html = render_to_string(BASE + "/templates/" + data['email_path'] + ".html", c)

    send_mail(subject, msg_txt, from_email, [to_email], html_message=msg_html, fail_silently=False)

def merge_two_dicts(x, y):
    z = x.copy()
    z.update(y)
    return z