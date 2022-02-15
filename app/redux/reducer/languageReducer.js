import {createSlice} from '@reduxjs/toolkit';

const language = {
    vietnamese: {
        nameLanguage:'VN',
        unknown:'không xác định',
        location:'Vị trí',
        whenNear:'khi ở gần',
        whenConnection:'khi kết nối',
        whenNotNear:'khi không ở gần',
        whenNotConnection:'khi không kết nối',
        taskTitle:'Lắng nghe để điều khiển thiết bị nhà bạn',
        taskDesc:'Có thể tắt thông báo trong cài đặt thông báo của bạn',
        pleaseAllowTheAppToUseYourLocation:'Vui lòng cho phép ứng dụng sử dụng vị trí của bạn',
        connectWifi:'Kết nối wifi',
        setCameraExternal:'Cài đặt camera ngoài',
        useCameraExternal:'Sử dụng camera ngoài',
        test:'Thử',
        shading:"Đang chia sẻ",
        move:"Chuyển động",
        use:"Sử dụng",
        selectLanguage:'Chọn một ngôn ngữ',
        start:'Bắt đầu',
        yes:'Có',
        no:'Không',
        next:'Tiếp tục',
        done:'Xong',
        add:'Thêm',
        edit:'Chỉnh sửa',
        save:'Lưu',
        try:'Thử',
        listDevice:'Danh sách thiết bị',
        device:'Thiết bị',
        amount:'Số lượng',
        noName:'Không có tên',
        noDevice:'Không có thiết bị nào',
        addDevice:'Thêm thiết bị',
        addDeviceWithCode:'Thêm thiết bị bằng mã thiết bị',
        searchDevice:'Tìm kiếm thiết bị . . .',
        chooseTheDeviceType:'Chọn loại thiết bị',
        chooseTheAirConditioner:'Chọn điều hòa',
        typeOfDevice:'Loại thiết bị',
        wifiSetting:'Cài đặt Wi-Fi',
        enterCodeDevice:'Nhập mã thiết bị',
        enterTheWifiName:'Nhập tên  Wi-FI',
        enterTheWifiPassword:'Nhập mật khẩu  Wi-FI',
        pleaseEnterTheFullNameAndYourWiFiPassword:'Vui lòng điền đầy đủ tên và mật khẩu Wi-Fi của bạn',
        wifiName:'Tên Wi-Fi',
        wifiPass:'Mật khẩu Wi-Fi',
        availability:'Khả dụng',
        scanTheDevice:'Quét thiết bị',
        unavailable:'không khả dụng',
        enableFingerprintLogin:'Kích hoạt đăng nhập bằng vân tay',
        logOut:'Đăng xuất',
        exitApp:'Thoát ứng dụng',
        reconnect:'kết nối lại',
        logIn:'Đăng nhập',
        cancel:'Hủy',
        oke:'Đồng ý',
        confirm:'Xác nhận',
        doYouWantToLogOut:'Bạn có muốn đăng xuất ?',
        doYouWantToExitApp:'Bạn có muốn thoát ứng dụng ?',
        openAirConditioner:'Máy lạnh mở',
        closeAirConditioner:'Máy lạnh tắt',
        doesTheAirConditionerRespond:'Máy lạnh có phản hồi không ?',
        openDoor:'Mở cửa',
        door:'Cửa',
        timer:'Hẹn giờ',
        hours:'Giờ',
        minute:'Phút',
        shareTo:'Chia sẽ đến',
        closeDoor:'Đóng cửa',
        theAirConditionerWillTurnOn:'Máy lạnh sẽ mở',
        theAirConditionerWillTurnOff:'Máy lạnh sẽ tắt',
        TheAirConditionerIsOff:'Máy lạnh đã tắt',
        PressToReopen:'Nhấn để mở lại',
        setTheTime:'Đặt thời gian',
        roomTemperature:'Nhiệt độ phòng',
        networkSignal:'Tín hiệu mạng',
        setAgain:'Đặt lại',
        stop:'Dừng',
        photograph:'Ảnh chụp',
        sharePhotos:'Share photos',
        areYouSureDelete:'Bạn có chắc chắn xóa ?',
        setUpYourVoice:'Thiết lập giọng nói',
        voiceInput:'Nhập giọng nói',
        input:'Nhập',
        status:'Trạng thái',
        thisCommandNotFound:'Không tìm thấy lệnh',
        yourDeviceCannotBeFound:'Rất tiếc! Không tìm thấy thiết bị của bạn...',
        allowsDoorControl:'Cho phép điều khiển cửa',
        thisOrderHasBeenDuplicated:'Lệnh này đã bị trùng',
        timeOverlaps:'thời gian bị trùng',
        date:'Ngày',
        AddDevice:'Thêm thiết bị',
        unknownDevice:'Thiết bị không xác định',
        settingWifi:'Cài đặt Wi-Fi',
        scanAirConfiguration:'Quét cấu hình máy lạnh',
        chooseAirConfiguration:'Chọn cấu hình máy lạnh',
        VoiceControl:'Điều khiển bằng giọng nói',
        setting:'Cài đặt',
        version:'Phiên bản',
        register:'Đăng ký',
        doNotHaveAnAccount:'Bạn chưa có tài khoản ?',
        forgetPassword:'Quên mật khẩu',
        rememberPassword:'Nhớ mật khẩu',
        pleaseFillInTheLoginInformation:'Vui lòng điền thông tin đăng nhập !',
        emailOrPhone:'Email hoặc Số điện thoại',
        userName:'Tên tài khoản',
        fullName:'Họ và tên',
        firstName:'Họ và tên lót',
        lastName:'Tên',
        password:'Mật khẩu',
        email:'Email',
        rePassword:'Xác nhận mật khẩu',
        newPassword:'Mật khẩu mới',
        newPasswordCreated:'Mật khẩu mới được tạo thành công',
        accountRegistrationIsSuccessful:'Đăng ký tài khoản thành công',
        registerExpired:'Đăng ký hết hạn!',
        DoYouWantToUseTheDevice:'Sử dụng thiết bị ',
        validate: {
            fullname: 'Tên đày đủ phải từ 6 kí tự',
            username: 'tài khoản phải từ 4 kí tự',
            pass: 'Mật khẩu phải từ 6 kí tự',
            email: 'email không đúng định dạng',
            email_exits: 'email đã được đăng ký trước đó',
            email_unknow: 'email không tồn tại',
            phone_exits: 'Số diện thoại đã được đăng ký trước đó',
            username_exits: 'tài khoản đã được đăng ký trước đó',
            phone: 'số điện thoại không đúng định dạng hoặc đã được đăng ký trước đó',
            errorOccurred: 'xảy ra lỗi',
            DEV_UNKNOW: 'thiết bị không xác định',
            USER_UNKNOWN: 'Tài khoản không xác định',
            USER_DELETED: 'Tài khoản đã bị xóa',
            USER_DISABLED: 'Tài khoản đã bị khóa',
            USER_USE_DATE: 'Tài khoản hết hạn',
        },
        chooseDevicesShare:'Chọn thiết bị chia sẻ',
        selectTheDeviceAgain:'Chọn lại thiết bị',
        numberPhone:'Số diện thoại',
        verifyCode:'Mã xác minh',
        getVerifyCode:'Lấy mã xác minh',
        noteGetVerifyCode:'Email này được sử dụng để đăng nhập và truy xuất mật khẩu của bạn. \n\n Chúng tôi sẽ gửi mã xác nhận đến email này. \n\n Hãy đảm bảo rằng bạn có quyền truy cập vào nó.',
        noteRegister:'Bạn có thể sử dụng số điện thoại để đăng nhập thay thế cho email.',
        reissuePassword:'Cấp lại mật khẩu',
        signInWithYourFingerprint:'Đăng nhập bằng vân tay',
        pleaseScanYourFingerprintToLoginTheApplication:'Vui lòng quét vân tay để đăng nhập ứng dụng.',
        fingerprintUnlock:'Mở khóa vân tay',
        haveYouCanceledAFingerprintForThisAccountToLogInWithFingerprints:'Bạn có chắc hủy vân tay cho tài khoản này?',
        useYourFingerprintLoginForTheCurrentAccount:'Sử dụng đăng nhập vân tay của bạn cho tài khoản hiện tại?',
        pleaseEnterYourCorrectHomeWiFiInformationToConnectWithOurDevice:'Vui lòng nhập thông tin Wi-Fi nhà của bạn để kết nối với thiết bị của chúng tôi!',
        activatedFingerprintLogin:'Đăng nhập bằng vân tay đã kích hoạt',
        activateFingerprintLogin:'Kích hoạt đăng nhập bằng vân tay',
        language:'Ngôn ngữ',
        theme:'Giao diện',
        accountsShare:'Tài khoản chia sẻ',
        successfulConnection:'Kết nối thành công!',
        account:'Tài khoản',
        accountLock:'Đã khóa tài khoản',
        accountDeleted:'Đã xóa tài khoản',
        deleteDevice:'Xóa thiết bị',
        deleteDeviceQuestion:'Thiết bị này không có kết nối. Bạn có muốn xóa không ?',
        doYouWantToDeleteThisDevice:'Bạn có muốn xóa thiết bị này không?',
        shareDevice:'Chia sẻ thiết bị',
        youAreShared:'Bạn được chia sẻ',
        shareNow:'Chia sẻ ngay',
        listOfSharedDevices:'Danh sách thiết bị đã chia sẻ',
        listOfUnsharedDevices:'Danh sách thiết bị chưa chia sẻ',
        noAccountYet:'Không có tài khoản !!',
        share:'Chia sẻ',
        setSharedStartTime:'Đặt thời gian bắt đầu chia sẻ:',
        setSharedEndTime:'Đặt thời gian kết thúc chia sẻ:',
        about:'Giới thiệu',
        schedule:'Lịch trình',
        doYouWantToDeleteSchedule:'Bạn muốn xóa lịch trình nầy không ?',
        supplier:'Thương hiệu',
        changeName:'Đổi tên',
        msgNotForYou:'Xin lỗi, chức năng này không dành cho bạn !',
        // pleaseEnterTheNameYouWantToChangeAboveAndPress:'Vui lòng nhập tên bạn muốn thay đổi ở trên và ấn ✔',
        noteAddDeviceWithCode:'Vui lòng nhập mã thiết bị ở trên và ấn ✔',
        searchForBrandOrModel:'Tìm kiếm thương hiệu',
        using:'Đang sử dung',
        chooseATheme:'Chọn một giao diện',
        themeDefault:'Mặc định' ,
        themeDark:'Tối',
        themeLight:'Sáng',
        pleaseWait:'Vui lòng đợi',
        pleaseTryAgain:'Vui lòng thử lại',
        warning:'Cảnh báo',
        error:'Lỗi',
        success:'Thành công',
        youAreInFanMode:'Bạn đang ở chế độ quạt ',
        youAreInMode:'Bạn đang ở chế độ ',
        noConnectWithThisDevice:'Không có kết nối với thiết bị này !',
        receivedDevice:'Đã nhận thiết bị',
        reduceHumidity:'Giảm độ ẩm',
        openTimeMustBeLessThanTimeOff:'Thời gian mở phải nhỏ hơn thời gian tắt!',
        addTheScheduleFor:'Thêm lịch trình cho ',
        temperature:'Nhiệt',
        temperatureControl:'Nhiệt độ điều khiển',
        userNameOrPasswordWrong:'Tài khoản hoặc mật khẩu không đúng',
        usernameCannotBeEmpty:'Tên đăng nhập không được trống',
        passwordCannotBeEmpty:'Mật khẩu không được trống !',
        serverConnected:'Đã kết nối máy chủ',
        tryingToReconnect:'Đang thử kết nối lại',
        connectionFailedCheckAgain:'kết nối không thành công, kiểm tra lại!',
        reconnectingTheServer:'Đang kết nối lại máy chủ ...',
        youNeedToSwitchBackToMode:'Bạn cần chuyển về chế độ ',
        doorAndCamera:'Cửa và Camera',
        airConditioner:'Máy lạnh',
        coolingMode:'Chế độ máy lạnh',
        monday:'Thứ 2',
        tuesday:'Thứ 3',
        wednesday:'Thứ 4',
        thursday:'Thứ 5',
        friday:'Thứ 6',
        saturday:'Thứ 7',
        sunday:'Chủ nhật',
        preview:'Xem trước',
        active:'Hoạt động',
        hello:'Chào',
        sayHello:'Xin chào',
        sharingInformation:'Thông tin chia sẻ',
        titleModelChooseDeviceShare:'Chọn thiết bị muốn chia sẻ cho tài khoản này chia sẻ',
        noteEditShareInfo:'Lưu ý: Nếu bạn khóa tài khoản thời gian chia sẻ sẽ không có hiệu lực.',
        noteViewShareDevice:'Lưu ý: Nếu bạn xóa vĩnh viễn bạn sẽ không thấy thông tin của tài khoản chia sẻ này nữa.',
        noteScanIR:"Ấn nút bắt đầu để tự động tìm thiết bị của bạn \n Hãy giữ đến khi máy lạnh nhận được tín hiệu thì thả tay ra",
        permanentlyDelete:'Xóa vĩnh viễn',
        recoverAccount:'Khôi phục tài khoản',
        update:'Cập nhật',
        lock:'Khóa',
        doorController:'Điều khiển cửa',
        cameraController:'Điều khiển camera',
        ControllerMode:'Chế độ điều khiển',
        airConditioningMode:'Chế độ máy lạnh',
        shared:'Đã chia sẻ',
        noInternetConnectionAvailable:'Không có kết nối internet',
        youHaveNotEnabledFingerprintLogin:'Bạn chưa bật tính năng đăng nhập bằng vân tay',
        logOutYourAccount:'Thoát tài khoản',
        youWantToExitThisAccount:'Bạn muốn thoát tài khoản này ?',
        pleaseAllowTheAppToReadImageFilesFromMemory:'Vui lòng cho phép ứng dụng đọc file ảnh từ bộ nhớ ',
        confirmYourPasswordDoesntMatchTheOneAbove: "Xác nhận mật khẩu của bạn không khớp với mật khẩu ở trên",
        fullMiddleNameMustBeCharacters:'Họ tên lót đủ phải từ 2 kí tự',
        authenticationCodeIsIncorrect:'mã xác thực không chính xác ',
        sorryThisFunctionIsNotForYou:'Xin lỗi, chức năng này không dành cho bạn !',
        successfulSetupSubmissionConnectToYourWifi:'Gửi setup thành công ! Kết nối wifi của bạn',
        sendSetupFailed:'Gửi setup thất bại, hãy chắn chắn rằng bạn đang kết nối với wifi thiết bị của chúng tôi thử lại sau !',
        youHaveNotGivenLocationAccessToThisAppYet:'Bạn chưa cho cấp quyền truy cập vị trí cho ứng dụng này',
        deletedSuccessfully:'Xoá thành công',
        fullNameMustBeFromCharacters:'Tên đày đủ phải từ 6 kí tự',
        youWantToRecoverThisAccount:'Bạn muốn khôi phục tài khoản này ?',
        youDontWantToSeeThisAccountAnymore:'Bạn không muốn thấy tài khoản này nữa?',
        youDontHaveADeviceToShare:`Bạn không có thiết bị nào để chia sẻ`,
        couldNotFindThisCommand:'Không tìm thấy lệnh này',
        doYouWantToRemoveUserFromTheDevice:'Bạn muốn xóa người dùng này khỏi thiết bị ?',
        doYouWantToDeleteThisAccount:'Do you want to delete this account?',
    },
    english: {
        nameLanguage:'EN',
        unknown:'unknown',
        location: "Location",
        whenNear:'when near',
        whenConnection:'when connection',
        whenNotNear:'when not near',
        whenNotConnection:'when not connection',
        taskTitle:'Listen to your home appliance control',
        taskDesc:'Notifications can be turned off in your notification settings',
        pleaseAllowTheAppToUseYourLocation:'Please allow the app to use your location',
        connectWifi:'Connect wifi',
        setCameraExternal:'Setting Camera External',
        useCameraExternal:'Use Camera External',
        test:'Test',
        shading:'Shading',
        move:'Move',
        use:'use',
        selectLanguage:'Select A Language',
        start:'Start',
        yes:'Yes',
        no:'No',
        next:'Next',
        done:'Done',
        add:'Add',
        edit:'Edit',
        save:'Save',
        try:'Try',
        listDevice:'List Device',
        device:'Device',
        amount:'Amount',
        noName:'No Name',
        noDevice:'No Device',
        addDevice:'Add Device',
        addDeviceWithCode:'Add Device With Code',
        searchDevice:'Search for the device. . .',
        chooseTheDeviceType:'Choose the device type',
        chooseTheAirConditioner:'choose air conditioner',
        typeOfDevice:'Type of device',
        wifiSetting:'Wi-Fi settings',
        enterCodeDevice:'Enter code device',
        enterTheWifiName:'Enter the Wi-Fi name',
        enterTheWifiPassword:'Enter the Wi-Fi password',
        pleaseEnterTheFullNameAndYourWiFiPassword:'Please enter the full name and your Wi-Fi password',
        wifiName:'Wi-Fi name',
        wifiPass:'Password',
        availability:'Availability',
        scanTheDevice:'Scan the device',
        unavailable:'Unavailable',
        enableFingerprintLogin:'Enable fingerprint login',
        logOut:'Logout',
        exitApp:'Exit app',
        reconnect:'Reconnect',
        logIn:'Login',
        cancel:'Cancel',
        oke:'Ok',
        confirm:'Confirm',
        doYouWantToLogOut:'Do you want to log out?',
        doYouWantToExitApp:'Do you want to exit app?',
        openAirConditioner:'Open air conditioner',
        closeAirConditioner:'Close Air Conditioner',
        doesTheAirConditionerRespond:'Does the air conditioner respond ?',
        openDoor:'Open door',
        door:'Door',
        timer:'Timer',
        hours:'Hours',
        minute:'Minute',
        shareTo:'Share to:',
        closeDoor:'Close door',
        theAirConditionerWillTurnOn:'Air conditioner turn on',
        theAirConditionerWillTurnOff:'Air conditioner turn off',
        TheAirConditionerIsOff:'The air conditioner is off',
        PressToReopen:'Press to reopen',
        setTheTime:'Set the time',
        roomTemperature:'Room temperature',
        networkSignal:'Network signal',
        setAgain:'Set again',
        stop:'Stop',
        photograph:'Photograph',
        sharePhotos:'Share photos',
        areYouSureDelete:'Are you sure delete ?',
        setUpYourVoice:'Set up your voice',
        voiceInput:'Input voice ',
        input:'Input',
        status:'Status',
        thisCommandNotFound:'This command not found',
        yourDeviceCannotBeFound:'Sorry! Your device cannot be found ...',
        allowsDoorControl:'Allows door control',
        thisOrderHasBeenDuplicated:'This order has been duplicated',
        timeOverlaps:'time overlaps',
        date:'Date',
        AddDevice:'Add device',
        unknownDevice:'Unknown device',
        settingWifi:'setting Wi-Fi',
        scanAirConfiguration:'Scan air conditioner configuration',
        chooseAirConfiguration:'Choose air conditioner configuration',
        VoiceControl:'Voice control',
        setting:'Setting',
        version:'Version',
        register:'Register',
        doNotHaveAnAccount:'Do not have an account ?',
        forgetPassword:'Forger password',
        rememberPassword:'Remember Password',
        pleaseFillInTheLoginInformation:'Please fill in the login information !',
        emailOrPhone:'Email Or Phone',
        userName:'User name',
        fullName:'Full name',
        firstName:'First name',
        lastName:'Last name',
        password:'Password',
        email:'Email',
        rePassword:'Re-Password',
        newPassword:'New password',
        newPasswordCreated:'New password is created successfully',
        accountRegistrationIsSuccessful:'Account registration is successful',
        registerExpired:'Register expired',
        DoYouWantToUseTheDevice:'Do you want to use the device ',
        validate: {
            fullname: 'Full name must be 6 characters',
            username: 'Account must be 4 characters',
            pass: 'Password must be 6 characters',
            email: 'Email invalidate',
            email_exits: 'email has been registered before',
            email_unknow: 'email unknow',
            phone_exits: 'phone has been registered before',
            username_exits: 'account has been registered before',
            phone: 'Phone number is not properly formatted or has been registered before',
            errorOccurred: 'Error occurred',
            DEV_UNKNOW: 'Unknown device',
            USER_UNKNOWN: 'Unknown account',
            USER_DELETED: 'The account has been deleted',
            USER_DISABLED: 'The account is locked',
            USER_USE_DATE: 'Account expires',
        },
        chooseDevicesShare:'Choose devices share',
        selectTheDeviceAgain:'select the device again',
        numberPhone:'Number phone',
        verifyCode:'Verify code',
        getVerifyCode:'Get verify code',
        noteGetVerifyCode:'This email is used to login and retrieve your password.\n\n We will send a confirmation code to this email. \n\n Make sure you have access to it.',
        noteRegister:'You can use phone number to alternate login for email.',
        reissuePassword:'Reissue password',
        signInWithYourFingerprint:'Sign in with your fingerprint',
        pleaseScanYourFingerprintToLoginTheApplication:'Please scan your fingerprint to login the application.',
        fingerprintUnlock:'Fingerprint unlock',
        haveYouCanceledAFingerprintForThisAccountToLogInWithFingerprints:'Are you sure you can cancel the fingerprint login for this account?',
        useYourFingerprintLoginForTheCurrentAccount:'Use your fingerprint login for the current account?',
        pleaseEnterYourCorrectHomeWiFiInformationToConnectWithOurDevice:'Please enter your correct home Wi-Fi information to connect with our device!',
        activatedFingerprintLogin:'Activated fingerprint login',
        activateFingerprintLogin:'Activate fingerprint login',
        language:'Language',
        theme:'Theme',
        accountsShare:'Accounts share',
        successfulConnection:'Successful connection!',
        account:'Account',
        accountLock:'Account lock',
        accountDeleted:'Account deleted',
        deleteDevice:'Delete Device',
        deleteDeviceQuestion:'This device has no connection. You may want to delete ?',
        doYouWantToDeleteThisDevice:"Do you want to delete this device?",
        shareDevice:'Share device',
        youAreShared:'You are shared',
        shareNow:'share now',
        listOfSharedDevices:'list of shared devices',
        listOfUnsharedDevices:'List of unshared devices',
        noAccountYet:'No account yet!',
        share:'share',
        setSharedStartTime:'Set the shared start time:',
        setSharedEndTime:'Set the shared end time:',
        about:'About',
        schedule:'Schedule',
        doYouWantToDeleteSchedule:'Do you want to delete this schedule ?',
        supplier:'Supplier',
        changeName:'Change name',
        msgNotForYou:'Sorry, this function is not for you!',
        // pleaseEnterTheNameYouWantToChangeAboveAndPress:'Please enter the name you want to change above and press ✔',
        noteAddDeviceWithCode:'Please enter code device and press ✔',
        searchForBrandOrModel:'Search for brand',
        using:'Using',
        chooseATheme:'Choose A Theme',
        themeDefault:'Default' ,
        themeDark:'Dark',
        themeLight:'Light',
        pleaseWait:'Please Wait',
        pleaseTryAgain:'Please try again',
        warning:'Warning',
        error:'Error',
        success:'Success',
        youAreInFanMode:'You are in fan mode  ',
        youAreInMode:'You are in mode',
        noConnectWithThisDevice:'No connect with this device!',
        receivedDevice:'Received device',
        reduceHumidity:'Reduce Humidity',
        openTimeMustBeLessThanTimeOff:'Open time must be less than time off!',
        addTheScheduleFor:'Add the history for ',
        temperature:'TMP',
        temperatureControl:'Temperature control',
        userNameOrPasswordWrong:'Username or password wrong!',
        usernameCannotBeEmpty:'Username cannot be empty!',
        passwordCannotBeEmpty:'Password cannot be empty!',
        serverConnected:'Server connected',
        tryingToReconnect:'Trying to reconnect',
        connectionFailedCheckAgain:'connection failed, check again!',
        reconnectingTheServer:'Reconnecting the server ...',
        youNeedToSwitchBackToMode:'You need to switch back to mode',
        doorAndCamera:'Door & camera',
        airConditioner:'Air-conditioner',
        coolingMode:'Cooling mode',
        monday:'Monday',
        tuesday:'Tuesday',
        wednesday:'Wednesday',
        thursday:'Thursday',
        friday:'Friday',
        saturday:'Saturday',
        sunday:'Sunday',
        preview:'Preview',
        active:'Active',
        hello:'Hello',
        sayHello:'Hello',
        sharingInformation:'Sharing information',
        titleModelChooseDeviceShare:'Select a sharing device for this account',
        noteEditShareInfo:'Note: If you lock your account, the sharing time will not be effective.',
        noteViewShareDevice:'Note: If you delete it permanently, you will no longer see the information of the shared account.',
        noteScanIR:'Press the start button to automatically find your device\n Keep holding until the air conditioner receives the signal, then let go of your hand',
        permanentlyDelete:'Permanently delete',
        recoverAccount:'Recover account',
        update:'Update',
        lock:'Lock',
        doorController:'Door controller',
        cameraController:'Camera controller',
        ControllerMode:'Controller Mode',
        airConditioningMode:'Air-conditioning mode',
        shared:'Shared',
        noInternetConnectionAvailable:'No internet connection available',
        youHaveNotEnabledFingerprintLogin:'You have not enabled fingerprint login',
        logOutYourAccount:'log out of your account',
        youWantToExitThisAccount:'You want to exit this account?',
        pleaseAllowTheAppToReadImageFilesFromMemory:'Please allow the app to read image files from memory',
        confirmYourPasswordDoesntMatchTheOneAbove:"Confirm your password doesn't match the one above",
        fullMiddleNameMustBeCharacters:'Full middle name must be 2 characters',
        authenticationCodeIsIncorrect:'Authentication code is incorrect',
        sorryThisFunctionIsNotForYou:'Sorry, this function is not for you!',
        successfulSetupSubmissionConnectToYourWifi:'Successful setup submission! Connect to your wifi',
        sendSetupFailed:'Send setup failed, please make sure you are connected to our wifi device, try again later!',
        youHaveNotGivenLocationAccessToThisAppYet:'You have not given location access to this app yet',
        deletedSuccessfully:'Deleted successfully',
        fullNameMustBeFromCharacters:'Full name must be from 6 characters',
        youWantToRecoverThisAccount:'You want to recover this account?',
        youDontWantToSeeThisAccountAnymore:`You don't want to see this account anymore?`,
        youDontHaveADeviceToShare:`You don't have a device to share`,
        couldNotFindThisCommand:'Could not find this command',
        doYouWantToRemoveUserFromTheDevice:'Do you want to remove this user from the device?',
        doYouWantToDeleteThisAccount:'Do you want to delete this account?',
    },
};

const initState = {
    language: language.english,
};
const languageSlice = createSlice({
    name: 'languages',
    initialState: initState,
    reducers: {
        setLanguage(state, action) {
            state.language = {...language[action.payload]};
        },
    },
});

const {actions, reducer} = languageSlice;

export const {setLanguage} = actions;

export default reducer;
