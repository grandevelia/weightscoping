from django.conf import settings

from django.core.mail import send_mail
from django.template.loader import render_to_string
BASE = getattr(settings, "BASE_DIR", None)
EMAIL_BASE = getattr(settings, "EMAIL_BASE", None)


def send_email(data):
    print("1")
    link = data['activation_key']
    print("2")
    c = {'key': link, 'basename': EMAIL_BASE}
    print("3")
    c = merge_two_dicts(c, data)
    print("4")

    subject = data['email_subject']
    print("5")
    from_email = "no-reply@reductiscope.com"
    print("6")
    to_email = data['email']
    print("7")

    msg_txt = render_to_string(
        BASE + "/templates/" + data['email_path'] + ".txt", c)
    print("8")
    msg_html = render_to_string(
        BASE + "/templates/" + data['email_path'] + ".html", c)
    print("9")

    send_mail(subject, msg_txt, from_email, [
              to_email], html_message=msg_html, fail_silently=False)
    print("10")


def merge_two_dicts(x, y):
    z = x.copy()
    z.update(y)
    return z
