/*
* 玩瞳样式-vue组件
*
*
*
*
*
* */
let vtContainer = {
    props:['breadcrumb'],
    template:`
        <div class="main-w">
            <div class="content-nav">
                <slot name="nav"></slot>
            </div>
            <div class="content-right">
                <div class="content-wrap-w">
                    <div class="content-r-path">{{breadcrumb}}</div>
                    <div class="content-box">
                        <slot name="main"></slot>
                    </div>
                </div>
            </div>
        </div>
    `
};
let vtContainerMain = {
    props:['breadcrumb'],
    template:`
        <div class="main-w">
            <div class="content-wrap-w">
                <div class="content-r-path">{{breadcrumb}}</div>
                <div class="content-box">
                    <slot></slot>
                </div>
            </div>
        </div>
    `
};
let vtButton = {
    props:['left'],
    template: `
        <button @click="$emit('click')" 
                :class="{'frame-Button-b'  : true, 'Button-left' : this.left !== undefined}">
            <slot></slot>
        </button>
   `
};
Vue.component('vt-container', vtContainer);
Vue.component('vt-container-main', vtContainerMain);
Vue.component('vt-button', vtButton);