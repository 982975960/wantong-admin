#!/bin/sh
source /etc/profile
script_path="`dirname $0`"
cd ${script_path}
DEPLOY_PATH=$(dirname "$PWD")
DEPLOY_NAME=$(basename ${DEPLOY_PATH})
INSTALL_ROOT="/mnt/nas_storage/deploy_javaapptmp/"
. `dirname $0`/getenv.sh
if [ ${APP_INSTALL_NAME} ]; then
	INSTALL_PROJECT=${INSTALL_ROOT}${APP_INSTALL_NAME}
else
	INSTALL_PROJECT=${INSTALL_ROOT}${APP_NAME}
fi
read -t 30 -n 1 -p "正在部署>>${DEPLOY_NAME}<< 将从${INSTALL_PROJECT}拷贝 是否继续(y/n)" continue_
if [ ! $continue_ == "y" ]; then
    echo "停止部署"
    exit -1
fi
backup(){
    if [ -d ${DEPLOY_PATH} ]; then
        if [ ! -d ${BACKUP_HOME} ]; then
                mkdir ${BACKUP_HOME}
        fi
        cp -r ${DEPLOY_PATH} "${BACKUP_HOME}/${DEPLOY_NAME}-`date +%Y%m%d%H%M%S`"
    fi
}
deploy(){
    if [ ! -d ${INSTALL_PROJECT} ]; then
            echo "temp文件不存在"
            exit -2
    fi
    if [ -d ${DEPLOY_PATH}/config ] && [ -d ${DEPLOY_PATH}/script ]; then
        rm -rf ${DEPLOY_PATH}/lib
        cp -r ${INSTALL_PROJECT}/lib ${DEPLOY_PATH}
        if [ -d ${INSTALL_PROJECT}/native_lib ]; then
            rm -rf ${DEPLOY_PATH}/native_lib
            cp -r ${INSTALL_PROJECT}/native_lib ${DEPLOY_PATH}
        fi
        if [ -d ${INSTALL_PROJECT}/config/static ]; then
            rm -rf ${DEPLOY_PATH}/config/static
            cp -r ${INSTALL_PROJECT}/config/static ${DEPLOY_PATH}/config
        fi
        bash ${DEPLOY_PATH}/script/restart.sh
    else
        echo "未找到config或script."
        exit -3
    fi
    echo -e "\n部署成功"
}
backup
deploy
