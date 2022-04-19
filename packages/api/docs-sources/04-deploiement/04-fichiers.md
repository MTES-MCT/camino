# Fichiers

## En local

### Envoyer les fichiers pdf (files) vers le serveur

```sh
# crée une archive
tar -zcvf files.tar.gz files/*

# envoie l'archive vers le serveur
scp -r files.tar.gz <user>@<ip>:/srv/tmp
```

### Récupérer les fichiers sur le serveur

```sh
# récupère les fichiers sur le serveur
scp -r <user>@<ip>:/srv/tmp/files/* files
```

## Sur le serveur

### Copier les fichiers

```bash
sudo cp /srv/www/camino/files/ /srv/tmp/files/
```
