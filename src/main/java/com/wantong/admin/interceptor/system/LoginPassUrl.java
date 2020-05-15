package com.wantong.admin.interceptor.system;

public class LoginPassUrl {

    private static String[] passUrls = new String[]{
            "/wangEditor.min.js.map",
            "/favicon.ico",
            "/showLogin",
            "/login",
            "/checkProtocolState.do",
            "/changeProtocolState.do",
            "/system/toSetPassword",
            "/system/setpassword",
            "/system/forgetpasword",
            "/system/loginOut",
            "/main",
            "/system/dashboard",
            "/system/teachingtools",
            "/userFeedBack",
            "/app/downloadApp",
            "/cms/auditionConvert",
            "/cms/loadPageAudios",
            "/cms/searchAllBooks",
            "/cms/changeBookState",
            "/cms/loadBookInfo",
            "/cms/listBooks",
            "/cms/createTask",
            "/cms/showAddBookPage",
            "/cms/savePageInfo",
            "/base/listBooks",
            "/base/showAddBookPage",
            "/base/loadBookInfo",
            "/base/changeBookState",
            "/base/savePageInfo",
            "/base/searchAllBooks",
            "/cms/listRepo.do",
            "/cms/getBookState.do",
            "/cms/createRepo.do",
            "/uploadFolder.do",
            "/cms/savePagesAudios.do",
            "/card/cardRepoList.do",
            "/card/getPartnerCardModel.do",
            "/card/showCreateRepo.do",
            "/card/getRepoInfo.do",
            "/card/getRepoInfo.do",
            "/feedback/getbookfeedbackList.do",
            "/feedback/getAppList.do",
            "/work/addBookIsbn.do",
            "/operating/checkTaskState.do",
            "/menu/userAgreement.do",
            "/cms/listPagesAndFingers.do",
            "/cms/savePagesFingersAudios.do",
            "/cms/checkBatchFingerAudiosState.do",
            "/cms/checkBatchAudiosState.do",
            "/operating/checkTaskState.do",
            "/app/updateiOSLink.do",
            "/app/loadiOSLink.do",
            "/operating/checkTaskState.do",
            "/work/openCreateWorkOrder.do",
            "/work/baseBookInfos.do",
            "/work/workOrderSearchRepeat.do",
            "/work/checkWorkOrderBooks.do",
            "/work/setSameBook.do",
            "/work/setSameTask.do",
            "/system/applyConfig.do",
            "/system/createParentUrl.do",
            "/base/deletePagesAccordingToBookId.do",
            "/base/savePagesData.do",
            "/base/checkBatchUploadPictureTaskState.do",
            "/base/checkDelBookPagesTaskState.do",
            "/work/bookProgressManager.do",
            "/work/bookProgressSearch.do",
            "/system/messageList.do",
            "/system/createData.do",
            "/system/updateData.do",
            "/system/changeDataIndex.do",
            "/system/deleteMessage.do",
            "/system/changeDataIndex.do",
            "/cms/uploadConfirm.do",
            "/cms/uploadBigfile.do",
            "/app/getUpdateAppInfo.do",
            "/work/checkBatchTask.do",
            "base/loadPageNyContent.do",
            "/base/similarBookByCover.do",
            "base/loadPageNyContent.do",
            "/app/appRepoCount.do",
            "base/loadPageNyContent.do",
            "/base/replaceBaseBook.do",
            "/base/bothBaseBookInOneRepo.do",
            "/cms/getBookSize.do",
            "/system/userSetEmailList.do",
            "/system/partnerUserEmail.do",
            "/system/saveUserSetData.do",
            "/app/authorizedQuantity.do",
            "/ass/feedbackList.do",
            "/ass/getBookInfoByIsbn.do",
            "/noResourceBookStatistics/listNoResourceBook.do",
            //todo
            "/card/cardGroup.do",
            "/card/loadCardGroupInfo.do",
            "/card/cardInfoList.do",
            "/card/loadCardInfo.do",
            "/card/changeCardStateIntoResource.do",
            "/card/changeCardStateIntoWaitTrain.do",
            "/card/fingerBook.do",
            "/card/saveFingerPosition.do",
            "/card/perspectiveImg.do",
            "/card/editModel.do",

            "/api/feedback/dashboard/setup",
            "/api/feedback/dashboard/data",
            "/api/feedback/dashboard/detail",
            "/api/feedback/dashboard/export"
    };

    private static String[] passUrlsForLoginUser = new String[]{
            "/upload",
            "/downloadTempFile",
            "/grabVideoImage.do"
    };


    private LoginPassUrl() {

    }

    public static String[] getPassThroughUrls() {
        return passUrls;
    }

    public static String[] getLoginUserPassThroughUrls() {
        return passUrlsForLoginUser;
    }

}
