<style lang="scss" scoped>
    $themeColor:#45b795;
    .heade{
        width: 375px;
        height: 44px;
        position: fixed;
        top: 0px;
        left: 0;
        z-index: 30000;
        background:none;
        /*color: #000;*/
    }
    .backlcon{
        width: 20px;
        height: 20px;
        position: absolute;
        left: 18px;
        top:12px;
        img{
            width: 100%;
            height: 100%;
        }
    }
    .headline{
        position: absolute;
        left: 50%;
        font-size: 18px;
        line-height: 44px;
        transform: translateX(-50%);
    }
    .box-fh{
        top: 27px;
    }


    .box{display: flex;position:relative;}
    .box-f1{flex: 1;}
    .box-ac{align-items: center}
    .box-jc{justify-content: center}
    .box-ver{flex-direction: column}
    .cropper-page{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
        background-color: #fff;
        overflow: hidden;
    }
    .cover{
        color:#FFF;
        font-size:.4rem;
        background-color: rgba(0,0,0,0.9);
    }
    .cropper-box{
        border:1px dashed #FFF;
    }
    .cropper-img{
        position: absolute;
        z-index: -1;
    }
    input[type="file"]{
        opacity: 0;
        position: fixed;
        top:-1000px;
        left:-1000px;
    }
    .btn{
        font-size:16px;
        padding:.1rem .3rem;
        /*border:.02rem solid;*/
        color:#FFF;
        border-radius:.1rem;
        &.sure{
            color:$themeColor;
        }
    }
</style>

<template>
    <div ref="cropperPage" class="cropper-page" v-show="isShow" >
        <div @click="cancel()" class="icon icon-back"></div>
        <input ref="file" type="file" accept="image/*" @change="readImage">
        <img alt="" class="cropper-img" :style="imageStyle" ref="img">
        <div class="cover box box-ac box-jc" :style="{height: coverHeight + 'px'}">
            <div class="heade">
                <div  @click="clickss"  class="backlcon" >
                    <img src="@assets/img/backlist.png"  />
                </div>
                <h1 class="headline">请调整图片</h1>
            </div>

        </div>
        <div ref="cropBox" class="cropper-box" @touchstart.prevent="touchStart" @touchmove.prevent="touchMove"></div>
        <div class="cover cover box box-ac box-jc" :style="{height: coverHeight + 'px'}">
            <div class="box box-f1 box-jc box-fh">
                <div class="btn" @click="checkPhoto">重选</div>
            </div>
            <div class="box box-f1 box-jc box-fh">
                <div class="btn sure" @click="confirm">确定</div>
            </div>
        </div>
    </div>
</template>

<script>
    // import EXIF from '../assets/js/exif-small'
    import lrz from 'lrz'
    const getDinstance = function (point0, point1) {
        return Math.sqrt(Math.pow(point0.pageY - point1.pageY, 2) + Math.pow(point0.pageX - point1.pageX, 2))
    }
    export default {
        name: 'imageCropper',
        props: {
            callback: {
                type: Function,
                default () {}
            },
            cropperConfig: {
                type: Object,
                default () {
                    return {
                        width: 1,
                        height: 1,
                        quality: 0.7,
                        maxWidth: 640
                    }
                }
            }
        },
        data () {
            return {
                coverHeight: 0,
                cropperHeight: 0,
                imgInitTop: 0,
                amplitude: 0,
                imageState: {
                    left: 0,
                    top: 0,
                    scale: 1,
                    width: 0,
                    height: 0,
                    originX: 0,
                    originY: 0
                },
                distance: 0,
                imageStyle: {
                    top: '0',
                    transform: 'translate3d(0px, 0px, 0px) scale(1)',
                    transformOrigin: 'left top'
                },
                cropBoxRect: {},
                touchPos: {
                    x: 0,
                    y: 0
                },
                isShow: false,
                minScale: 0,
                info: '',
                orientation: ''
            }
        },
        watch: {
            'imageState': {
                handler (val) {
                    // console.log(val)
                    this.imageStyle.transform = 'translate3d(-' + val.left + 'px, -' + val.top + 'px, 0px) scale(' + val.scale + ')'
                },
                deep: true
            }
        },
        methods: {
            cancel () {
                this.file = null
                this.isShow = false
            },
            checkPhoto () {
                this.$refs.file.click()
            },
            readImage ($event) {
                var self = this
                var file = $event.target.files[0]
                lrz(file)
                    .then(rst => {
                        self.orientation = 1
                        self.$refs.img.src = null
                        self.$refs.img.onload = () => {
                            self.initCropper()
                        }
                        self.$refs.img.src = rst.base64
                        $event.target.value = null
                    })
                // .always(() => {
                //   this.$store.commit('isLoading', false)
                // })
            },
            // readImage ($event) {
            //   var self = this
            //   var file = $event.target.files[0]
            //   var reader = new window.FileReader()
            //   reader.onload = () => {
            //     EXIF.getData(file, function () {
            //       let orientation = EXIF.getTag(this, 'Orientation')
            //       if (!orientation) orientation = 1
            //       self.orientation = orientation
            //       self.$refs.img.onload = () => {
            //         self.initCropper()
            //       }
            //       self.$refs.img.src = reader.result
            //       $event.target.value = null
            //     })
            //   }
            //   reader.readAsDataURL(file)
            // },
            initCropper () {
                this.isShow = true // 显示裁剪界面
                this.$nextTick(() => {
                    let cropperPage = this.$refs.cropperPage
                    let pageWidth = cropperPage.clientWidth
                    let pageHeight = cropperPage.clientHeight
                    let cropBox = this.$refs.cropBox
                    let cropBoxWidth = cropBox.clientWidth
                    let cropBoxHeight = Math.floor(cropBoxWidth * (+this.cropperConfig.height) / (+this.cropperConfig.width))
                    this.$refs.cropBox.style.height = cropBoxHeight + 'px'
                    this.coverHeight = (pageHeight - cropBoxHeight) / 2
                    let cropBoxTop = this.coverHeight
                    this.imageState.left = 0
                    this.imageState.top = 0
                    this.imageStyle.top = cropBoxTop + 'px'
                    this.cropBoxRect = {
                        left: 0,
                        top: cropBoxTop,
                        width: pageWidth,
                        height: cropBoxHeight
                    }
                    let img = this.$refs.img
                    var width = this.imageState.width = img.naturalWidth
                    var height = this.imageState.height = img.naturalHeight
                    // 计算imageState
                    if (width > height) {
                        this.minScale = this.imageState.scale = this.cropBoxRect.height / height
                        this.imageState.left = (width * this.imageState.scale - this.cropBoxRect.width) / 2
                    } else {
                        this.minScale = this.imageState.scale = this.cropBoxRect.width / width
                        this.imageState.top = (height * this.imageState.scale - this.cropBoxRect.height) / 2
                    }
                })
            },
            confirm () {
                let self = this
                let imageState = this.imageState
                let cropBoxRect = this.cropBoxRect
                // 导出图片的最大宽度
                let maxWidth = this.cropperConfig.maxWidth
                let scale2 = maxWidth / cropBoxRect.width
                let scale = imageState.scale * scale2
                let width = cropBoxRect.width * scale2
                let height = cropBoxRect.height * scale2
                let left = imageState.left * scale2
                let top = imageState.top * scale2
                let image = this.$refs.img
                let canvas = document.createElement('canvas')
                let ctx = canvas.getContext('2d')
                // ios 的照片有拍摄的角度信息 参考 http://www.bcty365.com/content-142-3055-1.html
                let orientation = this.orientation
                switch (orientation) {
                    case 1:
                        canvas.width = width
                        canvas.height = height
                        ctx.drawImage(image, left / scale, top / scale, width / scale, height / scale, 0, 0, width, height)
                        break
                    case 6:
                        canvas.width = height
                        canvas.height = width
                        ctx.rotate(90 * Math.PI / 180)
                        ctx.drawImage(image, left / scale, top / scale, width / scale, height / scale, 0, -height, width, height)
                        break
                    case 8:
                        canvas.width = height
                        canvas.height = width
                        ctx.rotate(-90 * Math.PI / 180)
                        ctx.drawImage(image, left / scale, top / scale, width / scale, height / scale, -width, 0, width, height)
                        break
                    case 3:
                        canvas.width = width
                        canvas.height = height
                        ctx.rotate(180 * Math.PI / 180)
                        ctx.drawImage(image, left / scale, top / scale, width / scale, height / scale, -width, -height, width, height)
                        break
                }
                let dataUrl = canvas.toDataURL('image/jpeg', this.cropperConfig.quality)
                let blob = this.dataURItoBlob(dataUrl)
                let fd = new FormData()
                fd.append('filename', blob , 'img.jpg')
                fd.append('fileCategoryCode', this.cropperConfig.fileCategoryCode)
                /* let para={
                   filename:blob,
                   fileCategoryCode:this.cropperConfig.fileCategoryCode
                 }*/
                self.callback(fd,dataUrl)
                self.isShow = false
            },
            getFocalPoint (point0, point1) {
                return {
                    x: (point0.pageX + point1.pageX) / 2,
                    y: (point0.pageY + point1.pageY) / 2
                }
            },
            clickss(){
                // this.$parent.goback();
                let self = this
                self.isShow = false
            },
            touchStart (event) {
                var fingerCount = event.touches.length
                if (fingerCount) {
                    // 记录触摸初始位置
                    let touchEvent = event.touches[0]
                    this.touchPos = {
                        x: touchEvent.clientX,
                        y: touchEvent.clientY
                    }
                }
                if (fingerCount >= 2) {
                    // 获取两点距离、中点位置；两点距离old/new=放大倍数；中点位置，缩放中心；
                    let point0 = event.touches[0]
                    let point1 = event.touches[1]
                    this.distance = getDinstance(point0, point1)
                    this.touchPos = this.getFocalPoint(point0, point1)
                    // 设置缩放倍数，
                }
            },
            touchMove (event) {
                // 根据触摸点位移，移动图片，重置触摸点位置
                var fingerCount = event.touches.length
                var touchEvent = event.touches[0]
                if (fingerCount === 1) {
                    let distX = touchEvent.pageX - this.touchPos.x
                    let distY = touchEvent.pageY - this.touchPos.y
                    let newX = this.imageState.left - distX
                    let newY = this.imageState.top - distY
                    let scale = this.imageState.scale
                    // alert(scale)
                    let maxX = this.imageState.width * scale - this.cropBoxRect.width
                    let maxY = this.imageState.height * scale - this.cropBoxRect.height
                    this.imageState.left = newX < 0 ? 0 : (newX > maxX ? maxX : newX)
                    this.imageState.top = newY < 0 ? 0 : (newY > maxY ? maxY : newY)
                    this.touchPos.x = touchEvent.pageX
                    this.touchPos.y = touchEvent.pageY
                } else if (fingerCount > 1) {
                    let point0 = event.touches[0]
                    let point1 = event.touches[1]
                    let distance = getDinstance(point0, point1)
                    let zoom = distance / this.distance
                    let scale = zoom * this.imageState.scale
                    let maxX = this.imageState.width * scale - this.cropBoxRect.width
                    let maxY = this.imageState.height * scale - this.cropBoxRect.height
                    let touchPos = this.getFocalPoint(point0, point1)
                    let newX = zoom * (this.imageState.left + touchPos.x) - touchPos.x
                    let newY = zoom * ((this.imageState.top - this.imgInitTop) + touchPos.y) - touchPos.y + this.imgInitTop
                    // 限制缩放
                    // 图片新位置:由中点位置确认;(新位置到中点)/(旧位置到中点)=(new scale)/(old scale)
                    // newLeft - touchPos.x = (distance / this.distance) * (oldLetf - touchPos.x)
                    // oldLeft = 0 - this.imageState.left
                    // oldTop = imgInitTop - this.imageState.top
                    this.distance = distance
                    if (scale < this.minScale) {
                        this.imageState.scale = this.minScale
                    } else {
                        this.imageState.scale = scale
                        this.imageState.left = newX < 0 ? 0 : (newX > maxX ? maxX : newX)
                        this.imageState.top = newY < 0 ? 0 : (newY > maxY ? maxY : newY)
                    }
                    this.touchPos = touchPos
                }
            },
            dataURItoBlob (base64Data) {
                let byteString
                if (base64Data.split(',')[0].indexOf('base64') >= 0) { byteString = atob(base64Data.split(',')[1]) } else { byteString = unescape(base64Data.split(',')[1]) }
                let mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0]
                let ia = new Uint8Array(byteString.length)
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i)
                }
                return new Blob([ia], {type: mimeString})
            }
        }
    }
</script>
