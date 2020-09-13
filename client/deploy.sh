REACT_APP_API_URI=lambda-url

yarn build 

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
aws s3 sync build/ s3://piano.peterevers.nl \
    --cache-control "public, max-age=3600, must-revalidate" \
    --exclude "static/*" \
    --exclude ".DS_Store" \
    --delete

aws s3 sync build/static s3://piano.peterevers.nl/static \
    --cache-control "public, max-age=2.592000, must-revalidate" \
    --exclude ".DS_Store" \
    --delete

aws cloudfront create-invalidation --distribution-id E1XBEIU20OOUV7 --paths / /index.html