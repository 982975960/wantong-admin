#!/bin/bash

#############################
# Set up environment        #
#############################
. `dirname $0`/getenv.sh

echo APP_HOME=$APP_HOME
echo APP_NAME=${APP_NAME}
echo env=${PROCESS_ENV}

for arg in $*
do
    case "$arg" in
        "-nohup"|"-n")
            JS_NOHUP=1
            ;;
        "-i")
            ;;
        -*)
            echo "Invalid argument: "$arg
            exit 8
            ;;
        *)
            if [[ "$MAIN_ARG" = "" ]]; then
                MAIN_ARG=$arg
            else
                echo "Already specified the main argument: "$MAIN_ARG
                exit 8
            fi
            ;;
    esac
done
echo MAIN_ARG=$MAIN_ARG

if [[ "$MAIN_ARG" = "" ]]; then
    GC_LOGFILE=${APP_NAME}.gc.log
else
    GC_LOGFILE=${APP_NAME}_${MAIN_ARG}.gc.log
fi

JAVA_OPTION="$JAVA_OPTION -verbosegc -XX:+PrintGCTimeStamps -Xloggc:${LOG_HOME}/${GC_LOGFILE} -Ddubbo.registry.file=/root/.dubbo/dubbo-registry-$PROCESS_NAME.cache"

CLASSPATH=$CLASSPATH:./lib/${APP_NAME}-${APP_VERSION}.jar

for jarpath in `ls ./lib/*.jar`
do
   if [ './lib/'${APP_NAME}'-'${APP_VERSION}'.jar' != $jarpath  ]
   then
      CLASSPATH=$CLASSPATH:$jarpath
   fi
done

export CLASSPATH
export APP_NAME
export LOG_HOME

mkdir -p ${LOG_HOME}
nohup $JAVA_HOME/bin/java $JAVA_OPTION $MAIN_CLASS $MAIN_ARG > /dev/null 2>${LOG_HOME}/error_boot.log &
#$JAVA_HOME/bin/java $JAVA_OPTION $MAIN_CLASS $MAIN_ARG
#echo $JAVA_HOME/bin/java $JAVA_OPTION $MAIN_CLASS $MAIN_ARG
#$JAVA_HOME/bin/java $JAVA_OPTION $MAIN_CLASS $MAIN_ARG

#RETURN_CODE=$?
#
#if [ $RETURN_CODE != 0 ]; then
#    echo ""
#    echo "ERROR: Exit with non-zero code, "$RETURN_CODE
#    exit $RETURN_CODE;
#fi

ps -ef|grep -v grep| grep "${PROCESS_NAME}.*${MAIN_CLASS}"
