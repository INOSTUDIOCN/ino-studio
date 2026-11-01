-- Permet de joindre un document de référence (PDF/DOCX préparé par l'admin,
-- par exemple le vrai contrat rédigé) à un contrat, en plus des champs
-- interactifs (cases à cocher, résumé, signature).
alter table public.contracts add column document_path text;
alter table public.contracts add column document_name text;

insert into storage.buckets (id, name, public)
values ('contract-documents', 'contract-documents', false)
on conflict (id) do nothing;
