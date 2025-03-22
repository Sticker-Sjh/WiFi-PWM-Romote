// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    currentTime: '--:--:--',
    alarms: [], // 存储所有闹钟 [{id, time}]
    nextAlarmId: 1,
    //需要修改的地方
    uid:"66cefa140f36afae8f6470a6463e5350",//用户密钥，巴法云控制台获取
    ledtopic:"mao",//控制led的主题，创客云控制台创建
    dhttopic:"temp",//传输温湿度的主题，创客云控制台创建

    device_status:"离线",// 显示led是否在线的字符串，默认离线
    ledOnOff:"关闭",     //显示led开关状态
    checked: false,     //led的状态记录。默认led关闭
    wendu:"",//温度值，默认为空
    shidu:"",//湿度值，默认为空
    dataTime:"", //记录数据上传的时间
    ledicon:"/utils/img/lightoff.png",//显示led图标的状态。默认是关闭状态图标
    client: null,//mqtt客户端，默认为空
  },

//屏幕打开时执行的函数
  onLoad() {
    //检查设备是否在线
    this.getOnline()
    //检查设备是打开还是关闭
    this.getOnOff()
    //获取服务器上现在存储的dht11数据
    // this.getdht11()
    //设置定时器，每3秒请求一下设备状态
    setInterval(this.getdht11, 3000)
  },
  //控制灯的函数1，小滑块点击后执行的函数
  onChange({ detail }){
    //detail是滑块的值，检查是打开还是关闭，并更换正确图标
    this.setData({ 
      checked: detail,
     });
     if(detail == true){//如果是打开操作
      this.LedSendMsg("open") //发送打开指令
      this.setData({ 
        ledicon: "/utils/img/lighton.png",//设置led图片为on
       });
     }else{
      this.LedSendMsg("close") //发送关闭指令
      this.setData({ 
        ledicon: "/utils/img/lightoff.png",//设置led图片为off
       });
     }
  },
  //点击led图片执行的函数
  onChange2(){
    var that = this
      //如果点击前是打开状态，现在更换为关闭状态，并更换图标，完成状态切换
      if( that.data.checked == true){
        that.LedSendMsg("close")//发送关闭指令
        this.setData({ 
            ledicon: "/utils/img/lightoff.png",//设置led图片为off
            checked:false //设置led状态为false
         });
      }else{
        //如果点击前是关闭状态，现在更换为打开状态，并更换图标，完成状态切换
        that.LedSendMsg("open")//发送打开指令
        that.setData({ 
          ledicon: "/utils/img/lighton.png",//设置led图片为on
          checked:true//设置led状态为true
       });
      }
  },
  //请求设备状态,检查设备是否在线
  getOnline(){
    var that = this
     //api 接口详细说明见巴法云接入文档
    wx.request({
      url: 'https://api.bemfa.com/api/device/v1/status/?', //状态api接口，详见巴法云接入文档
      data: {
        uid: that.data.uid,
        topic: that.data.ledtopic,
      },
      header: {
        'content-type': "application/x-www-form-urlencoded"
      },
      success (res) {
        console.log(res.data)
        if(res.data.status === "online"){//如果在线
          that.setData({
            device_status:"在线"  //设置状态为在线
          })
        }else{                          //如果不在线
          that.setData({
            device_status:"离线"   //设置状态为离线
          })
        }
        console.log(that.data.device_status)
      }
    })    
  },
   //获取开关状态，检查设备是打开还是关闭
  getOnOff(){
    //api 接口详细说明见巴法云接入文档
    var that = this
    wx.request({
      url: 'https://api.bemfa.com/api/device/v1/data/1/get/', //状态api接口，详见巴法云接入文档
      data: {
        uid: that.data.uid,
        topic: that.data.ledtopic,
        num:1
      },
      header: {
        'content-type': "application/x-www-form-urlencoded"
      },
      success (res) {
        console.log(res.data.msg)
        if(res.data.msg == "on"){  //如果开关on
          that.setData({
            checked:true,
            ledOnOff:"打开",
            ledicon: "/utils/img/lighton.png",
          })
        }else{           //如果开关off
          that.setData({
            checked:false,
            ledOnOff:"关闭",
            ledicon: "/utils/img/lightoff.png",
          })
        }
      }
    })    
  },
  // getdht11(){
  //   //获取温湿度值，屏幕初始化时，未订阅收到温湿度时，先去主动获取值
  //   //api 接口详细说明见巴法云接入文档
  //   var that = this
  //   wx.request({
  //     url: 'https://api.bemfa.com/api/device/v1/data/1/get/', //状态api接口，详见巴法云接入文档
  //     data: {
  //       uid: that.data.uid,
  //       topic: that.data.dhttopic,
  //       num:1
  //     },
  //     header: {
  //       'content-type': "application/x-www-form-urlencoded"
  //     },
  //     success (res) {
       
  //       console.log(res)
  //       if(res.data.msg.indexOf("#") != -1){//如果数据里包含#号，表示获取的是传感器值，因为单片机上传数据的时候用#号进行了包裹
  //         //如果有#号就进行字符串分割
  //         var all_data_arr = res.data.msg.split("#"); //分割数据，并把分割后的数据放到数组里。
  //         console.log(all_data_arr)//打印数组
  //         that.setData({ //数据赋值给变量
  //           wendu:all_data_arr[1],//赋值温度
  //           shidu:all_data_arr[2], //赋值湿度
  //           dataTime:res.data.time
  //         })

  //         if(all_data_arr[3] != undefined){//判断是否上传了led状态
  //           if(all_data_arr[3] == "on"){//如果单片机处于打开状态
  //               that.setData({ //数据赋值给变量
  //                 ledOnOff:"打开",//赋值led状态
  //               })
  //           }else{
  //             that.setData({ //数据赋值给变量
  //               ledOnOff:"关闭",//赋值led状态
  //             })
  //           }
  //     }

  //       }
  //     }
  //   })    
  // },
  //发送开关数据
  LedSendMsg(msg){
    wx.request({
      url: 'https://api.bemfa.com/api/device/v1/data/1/push/get/?', //状态api接口，详见巴法云接入文档
      data: {
        uid: this.data.uid,
        topic: this.data.ledtopic,
        msg:msg
      },
      header: {
        'content-type': "application/x-www-form-urlencoded"
      },
      success (res) {
      }
    })   
  },
  onLoad() {
    this.startTimeSync();
  },

  // 时间同步（双保险机制）
  startTimeSync() {
    // 网络时间获取
    wx.request({
      url: 'https://worldtimeapi.org/api/timezone/Asia/Shanghai',
      success: res => {
        const serverTime = new Date(res.data.datetime);
        this.initClock(serverTime);
      },
      fail: () => this.initClock() // 失败时使用本地时间
    });
  },

  // 初始化时钟
  initClock(serverTime) {
    const initTime = serverTime || new Date();
    let seconds = initTime.getSeconds();
    
    // 精准时间同步
    this.timeUpdater = setInterval(() => {
      const now = new Date(initTime.getTime() + (Date.now() - initTime.getTime()));
      this.setData({
        currentTime: `${now.getHours().toString().padStart(2, '0')}:` +
                    `${now.getMinutes().toString().padStart(2, '0')}:` +
                    `${now.getSeconds().toString().padStart(2, '0')}`
      });
      
      // 闹钟检查（每秒检查10次提高精度）
      if(seconds !== now.getSeconds()) {
        seconds = now.getSeconds();
        this.checkAlarms(now);
      }
    }, 100);
  },

  // 添加闹钟
  addAlarm(e) {
    const newTime = e.detail.value;
    if(!newTime) return;

    this.setData({
      alarms: [...this.data.alarms, {
        id: this.data.nextAlarmId,
        time: newTime
      }],
      nextAlarmId: this.data.nextAlarmId + 1
    });
  },

  // 删除闹钟
  removeAlarm(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      alarms: this.data.alarms.filter(alarm => alarm.id !== id)
    });
  },

  // 闹钟检查（精确到秒）
  checkAlarms(now) {
    const current = `${now.getHours().toString().padStart(2, '0')}:` +
                    `${now.getMinutes().toString().padStart(2, '0')}`;
    
    this.data.alarms.forEach(alarm => {
      if(alarm.time === current && now.getSeconds() === 0) {
        this.triggerAlarm(alarm.id);
      }
    });
  },

  // 触发闹钟
  triggerAlarm(id) {
    // 执行LED控制
    // if(typeof LedSendMsg === 'function') {
    //   this.LedSendMsg("open");
    // } else {
    //   this.LedSendMsg("open");
    //   console.error('LED控制函数未定义');
    // }
    this.LedSendMsg("open");
    // 震动反馈
    wx.vibrateLong();
    
    // 显示通知
    wx.showModal({
      title: '闹钟触发',
      content: '设备已启动',
      showCancel: false
    });
  },

  onUnload() {
    clearInterval(this.timeUpdater);
  }
});
