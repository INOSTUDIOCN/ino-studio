-- Signature du studio (Ino Studio), apposee a la creation d'un contrat a
-- signer, affichee a cote de la signature du client dans le PDF final.
alter table public.contracts add column admin_signature_data text;
