docker compose down
echo "container is shut down"
echo "getting latest changes from github"
git pull origin main
echo "updating docker image"
docker compose pull
docker compose up -d
echo "container is back online"
echo "update finished"