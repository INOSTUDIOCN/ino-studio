-- Un contrat de discussion precede souvent le projet lui meme (le client
-- choisit ce qu'il veut avant que l'admin cree le projet correspondant).
alter table public.contracts alter column project_id drop not null;
