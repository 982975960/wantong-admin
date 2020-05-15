#!/bin/bash

#############################
# Set up environment        #
#############################
. `dirname $0`/getenv.sh

echo Preparing to stop ${PROCESS_NAME}
echo PROCESS_PORT=$PROCESS_PORT
echo APP_NAME=$APP_NAME

PS_CMD="ps -ef|grep -v grep| grep \"${PROCESS_NAME}.*${MAIN_CLASS}\""
echo PS CMD=${PS_CMD}
eval ${PS_CMD}
rec_code=$?
if [[ $rec_code != 0 ]]; then
    echo ${PROCESS_NAME} not in running.
    exit 0;
fi

#echo `curl "http://localhost:${PROCESS_PORT}/?app=${APP_NAME}&command=stop"`

check_times=1
default_max_stop_wait_sec=60
APP_PID=`ps -ef|grep -v grep| grep "${PROCESS_NAME}.*${MAIN_CLASS}"| awk '{print $2}'`
echo APP_PID=$APP_PID
kill $APP_PID
while [[ "$APP_PID" != "" ]]
do
        let "check_times +=1"

        if [ $MAX_STOP_WAIT_SEC ]; then
          default_max_stop_wait_sec=$MAX_STOP_WAIT_SEC
        fi

        if [ $check_times -gt $default_max_stop_wait_sec ]; then
          kill -9 $APP_PID
          echo "Force stoping ${PROCESS_NAME}(${APP_PID})"
        else
          echo "waiting ${PROCESS_NAME}(${APP_PID}) to be stopped."
          sleep 1
        fi
        APP_PID=`ps -ef|grep -v grep| grep "${PROCESS_NAME}.*${MAIN_CLASS}"| awk '{print $2}'`
done

echo "${PROCESS_NAME} Stopped!"
