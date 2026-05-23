from apps.catalog.management.commands.seed_demo import Command as SeedCommand


class Command(SeedCommand):
    help = "Bootstrap the shop with a full starter furniture catalog."
