-- Permet de limiter le nombre de demandes de devis par adresse IP
-- (anti spam, en plus du honeypot et du délai minimal côté formulaire).
alter table public.devis_requests add column ip_address text;
