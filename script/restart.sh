
#############################
# Set up environment        #
#############################
. `dirname $0`/getenv.sh

echo APP_HOME=$APP_HOME
echo APP_NAME=${APP_NAME}

./script/stop.sh
./script/start.sh