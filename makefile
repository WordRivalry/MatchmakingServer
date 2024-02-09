build:
	# Build the docker image
	docker build -t matchmakingserver .

docker-run:
	# Run the docker image
	docker run -p 8080:8080 --rm --name matchmakingserver-container matchmakingserver

docker-tag:
	# Tag the docker image
	docker tag matchmakingserver:latest gcr.io/wordrivalry/matchmakingserver:latest

docker-push:
	# Push the docker image to Google Cloud Registry
	docker push gcr.io/wordrivalry/matchmakingserver:latest

docker-deploy: build docker-tag docker-push
	# Deploy the docker image to Google Cloud Run
	gcloud run deploy matchmakingserver --image gcr.io/wordrivalry/matchmakingserver:latest --platform managed --allow-unauthenticated

# Had to run `gcloud config set project wordrivalry` to set the project to wordrivalry in gcloud cli