echo ---------- GET ENV START -----------
APP_HOME=`dirname $0`/../
cd $APP_HOME
APP_HOME=`pwd`
APP_HOME_DEPLOY="/www/apps/"

APP_NAME="wantong-admin"
APP_NAME_LON=${APP_NAME,,}
APP_VERSION="3.7.2-SNAPSHOT"

echo APP_NAME=$APP_NAME
echo APP_NAME_LON=$APP_NAME_LON
echo APP_VERSION=$APP_VERSION

PROPERTIES_FILE=$APP_HOME/config/bootstrap.yml
PROCESS_PORT=`grep jetty.port ${PROPERTIES_FILE}|cut -d'=' -f2|tr -d "\r"`
PROCESS_ENV=`grep process.env ${PROPERTIES_FILE}|cut -d'=' -f2|tr -d "\r"`
HOST_IP=`/sbin/ifconfig eth0|grep inet|grep -v 127.0.0.1|grep -v inet6|awk '{print $2}'|tr -d "addr:"`
echo PROCESS_PORT=$PROCESS_PORT
echo PROCESS_ENV=$PROCESS_ENV

if [[ "$PROCESS_ENV" == "" ]]; then
    PROCESS_NAME=${APP_NAME_LON}
else
    PROCESS_NAME="${APP_NAME_LON}-${PROCESS_ENV}"
fi

BACKUP_HOME="/data/app-backup/${APP_NAME}"
LOG_HOME="/data/logs/${APP_NAME}-log"
DIST_FILE="${APP_NAME}-${APP_VERSION}-distribution.zip"
TEMP_HOME="/mnt/nas_storage/deploy_javaapptmp/" #临时文件主目录
TEMP_FILE=$APP_NAME-$APP_VERSION #临时文件名

MAIN_CLASS=com.wantong.admin.AdminApplication
MAX_STOP_WAIT_SEC=60

JAVA_OPTION="$JAVA_OPTION -Xms2048m -Xmx2048m"
JAVA_OPTION="$JAVA_OPTION -Dlogging.config=${APP_HOME}/config/logback-spring.xml -Dspring.config.location=${PROPERTIES_FILE}"
JAVA_OPTION="$JAVA_OPTION -Dfile.encoding=utf-8 -Denv=${PROCESS_ENV} -Djava.io.tmpdir=/data/tomcattemp"
JAVA_OPTION="$JAVA_OPTION -DprocessName=$PROCESS_NAME -DhostName=$HOSTNAME -DhostIp=$HOST_IP"
#JAVA_OPTION="$JAVA_OPTION -javaagent:/ec/apps/${APP_NAME}/tingyun/tingyun-agent-java.jar"
#如需远程调试模式,请打开此注释，端口默认为8000，如被占用可更改
#JAVA_OPTION="$JAVA_OPTION -Xdebug -Xrunjdwp:server=y,transport=dt_socket,address=8000,suspend=n"

#JENKINS_RSA_KEY=/home/jenkins/.ssh/jenkins
#JENKINS_HOST=jenkins@192.168.1.21

JAVA_HOME=/usr/local/jdk1.8

echo PROCESS_NAME=$PROCESS_NAME
echo BACKUP_HOME=$BACKUP_HOME
echo DIST_FILE=$DIST_FILE
echo MAIN_CLASS=$MAIN_CLASS

echo ---------- GET ENV END -----------
