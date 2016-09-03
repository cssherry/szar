"""Creates RSVP model"""
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class RSVP(models.Model):
    """Model stores RSVP form inputs"""
    guest = models.OneToOneField('auth.User')
    attending = models.NullBooleanField()
    vegetarian = models.NullBooleanField()
    other_dietary_restrictions = models.TextField(blank=True, null=True, default="")
    SATURDAY = 1
    SUNDAY = 2
    DATE_OPTIONS = (
        (SATURDAY, "Saturday evening reception"),
        (SUNDAY, "Sunday morning wedding ceremony and brunch"),
    )
    AIRFARE = 0
    DAY1 = 1
    DAY2 = 2
    DAY3 = 3
    DAY4 = 4
    DAY5 = 5
    DAY6 = 6
    DAY7 = 7
    DAY8 = 8
    OTHER = -1
    GIFT_TYPE = (
      (AIRFARE, "Airfare"),
      (DAY1, "Day 1 in Bhutan"),
      (DAY2, "Day 2 in Bhutan"),
      (DAY3, "Day 3 in Bhutan"),
      (DAY4, "Day 4 in Bhutan"),
      (DAY5, "Day 5 in Bhutan"),
      (DAY6, "Day 6 in Bhutan"),
      (DAY7, "Day 7 in Bhutan"),
      (DAY8, "Day 8 in Bhutan"),
      (OTHER, "Other"),
    )
    attending_dates = models.CommaSeparatedIntegerField(max_length=4,
                                                        choices=DATE_OPTIONS,
                                                        blank=True)
    need_carpool = models.NullBooleanField()
    need_hotel = models.NullBooleanField()
    wine_tasting = models.NullBooleanField()
    plus_one = models.BooleanField(default=False)
    plus_one_name = models.CharField(max_length=200, null=True, unique=True, default=None)
    song_requests = models.TextField(default="", blank=True)
    gift = models.NullBooleanField(default=False)
    formal_prefix = models.CharField(max_length=200, blank=True)
    affiliation = models.CharField(default="", max_length=200)
    number_attendees = models.IntegerField(default=None, null=True, blank=True)
    expected_attendees = models.DecimalField(default=1, max_digits=4, decimal_places=1)
    created_date = models.DateTimeField(default=timezone.now, editable=False)
    edited_date = models.DateTimeField(default=timezone.now, blank=True)
    sent_emails = models.TextField(default="{}", blank=True)
    comments = models.TextField(default="", blank=True)
    gift_type = models.CommaSeparatedIntegerField(max_length=1,
                                                  choices=GIFT_TYPE,
                                                  null=True,
                                                  blank=True)
    gift_amount = models.DecimalField(default=0, max_digits=8, decimal_places=2)
    gift_message = models.TextField(default="", blank=True)
    address = models.TextField(default="", blank=True)

    def edit(self, new_values):
        """Publishes RSVP"""
        self.edited_date = timezone.now()
        for attr, value in new_values.items():
            setattr(self, attr, value)
            if attr == "expected_attendees" and not hasattr(new_values, "plus_one"):
                if value <= 1:
                    setattr(self, "plus_one", False)
                else:
                    setattr(self, "plus_one", True)
        self.save()

    def name(self):
        if self.formal_prefix:
            return self.formal_prefix + " " + self.guest.last_name
        else:
            return self.guest.first_name

    def full_name(self):
        return self.guest.first_name + " " + self.guest.last_name

    def has_valid_email(self):
        return self.guest and self.guest.email.find("@") != -1

    def delete(self):
        user = User.objects.filter(id=self.guest_id)
        if len(user) > 0:
          user[0].delete()
        super(RSVP, self).delete()

    def __str__(self):
        return self.guest.username
