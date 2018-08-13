from django.conf import settings

from django.core.mail import send_mail
from django.template.loader import render_to_string
BASE = getattr(settings, "BASE_DIR", None)

def send_email(data):
    link = data['activation_key']
    c = {'key':link, 'basename':BASE}
    c = merge_two_dicts(c, data)

    subject = data['email_subject']
    from_email = "no-reply@weightscoping.com"
    to_email = data['email']

    msg_txt = render_to_string(BASE + "/templates/" + data['email_path'] + ".txt", c)
    msg_html = render_to_string(BASE + "/templates/" + data['email_path'] + ".html", c)

    send_mail(subject, msg_txt, from_email, [to_email], html_message=msg_html, fail_silently=False)

def merge_two_dicts(x, y):
    z = x.copy()   # start with x's keys and values
    z.update(y)    # modifies z with y's keys and values & returns None
    return z