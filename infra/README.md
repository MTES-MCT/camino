# Première initialisation

Lors de la première installation de camino (sur ovh), un utilisateur "debian" est crée par défaut, avec l'accès ssh.

Il faut forcer ansible à utiliser cet utilisateur, via cette commande: `ansible-playbook -i inventory_{dev|preprod|prod} --ask-become-pass -u debian --vault-id camino@prompt deploy.yml`

Le script va créer les utilisateurs qui auront les droits de gérer la machine, puis supprimer l'utilisateur "debian".

ATTENTION, le script va planter, il faudra:
- vous connecter en ssh avec votre login pour pouvoir changer votre mot de passe
- relancer ansible normalement (make dev|preprod|prod)
- déployer la bonne version de camino (via github actions)
- aller sur la machine, et lancer le processus de restauration des backups --> `./srv/scripts/restore-last-backup`
