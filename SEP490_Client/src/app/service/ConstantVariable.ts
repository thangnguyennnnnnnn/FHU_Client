export class ConstantVariable {

    public readonly ERROR_NUMBER = 255;

    public readonly ERROR_UPDATE = 2001;
    
    public readonly SUCCESS_NUMBER = 0;

    public readonly DUBLICATE_DB_NUMBER = 1;
	
	public readonly DUPLICATE_KEY = 2627;
	
	public readonly DB_NOTFOUND = 2;

    public readonly OUT_SESSION = 3;

    public readonly INPUT_EMPTY_VALUE = 2002;

    public readonly AUTHOR_ERROR_NUMBER = 1800;

    public readonly FILE_EMPTY = 1900;

    public readonly FILE_FORMAT_ERROR = 2000;

    public readonly NO_CHANGE_ERROR = 2100;

    //public readonly CONTENT_API_SERVER = 'https://fhc-server-394702.ue.r.appspot.com/';

    public readonly CONTENT_API_SERVER = 'http://localhost:8080/';

    // public readonly CONTENT_API_SERVER = 'https://fhc-server-394702.ue.r.appspot.com/';

    //public readonly CONTENT_API_CLIENT = 'https://fhc-client.web.app/'; 

    public readonly CONTENT_API_CLIENT = 'https://localhost:4200/'; 

    public readonly CONTENT_API_REALTIME = 'wss://http://localhost:3000?room='

    public readonly DIAGNOSTIC_STATUS = {
        'Đang khám': '0',
        'Đợi khám': '8',
        'Ổn định - Không vấn đề': '1',
        'Uống thuốc theo chỉ định': '2',
        'Nhập viện điều trị': '3',
    };

    public readonly PROVIDE = [
        {
            id: 'VN',
            name: 'Việt Nam',
            provide: [
                {
                    id: 'DN',
                    name: 'Đà Nẵng',
                    district: [
                        {  
                            id: 'HC'  ,
                            name: 'Hải Châu',
                            ward: [
                                {
                                    id: 'BH',
                                    name: 'Bình Hiên'
                                },
                                {
                                    id: 'BT',
                                    name: 'Bình Thuận'
                                },
                                {
                                    id: 'HCI',
                                    name: 'Hải Châu I'
                                },
                                {
                                    id: 'HCII',
                                    name: 'Hải Châu II'
                                },
                                {
                                    id: 'HCB',
                                    name: 'Hòa Cường Bắc'
                                },
                                {
                                    id: 'HCN',
                                    name: 'Hòa Cường Nam'
                                },
                                {
                                    id: 'HTĐ',
                                    name: 'Hòa Thuận Đông'
                                },
                                {
                                    id: 'HTT',
                                    name: 'Hòa Thuận Tây'
                                },
                                {
                                    id: 'ND',
                                    name: 'Nam Dương'
                                },
                                {
                                    id: 'PN',
                                    name: 'Phước Ninh'
                                },
                                {
                                    id: 'TT',
                                    name: 'Thạch Thang'
                                },
                                {
                                    id: 'TB',
                                    name: 'Thanh Bình'
                                },
                                {
                                    id: 'TP',
                                    name: 'Thuận Phước'
                                }
                            ]
                        },
                        {  
                            id: 'CL'  ,
                            name: 'Cẩm Lệ',
                            ward: [
                                {
                                    id: 'KT',
                                    name: 'Khuê Trung'
                                },
                                {
                                    id: 'HP',
                                    name: 'Hòa Phát'
                                },
                                {
                                    id: 'HA',
                                    name: 'Hòa An'
                                },
                                {
                                    id: 'HTT',
                                    name: 'Hòa Thọ Tây'
                                },
                                {
                                    id: 'HTĐ',
                                    name: 'Hòa Thọ Đông'
                                },
                                {
                                    id: 'HX',
                                    name: 'Hòa Xuân'
                                }
                            ]
                        },
                        {  
                            id: 'TK'  ,
                            name: 'Thanh Khê',
                            ward: [
                                {
                                    id: 'AK',
                                    name: 'An Khê'
                                },
                                {
                                    id: 'CG',
                                    name: 'Chính Gián'
                                },
                                {
                                    id: 'HK',
                                    name: 'Hòa Khê'
                                },
                                {
                                    id: 'TT',
                                    name: 'Tam Thuận'
                                },
                                {
                                    id: 'TC',
                                    name: 'Tân Chính'
                                },
                                {
                                    id: 'TG',
                                    name: 'Thạc Gián'
                                },
                                {
                                    id: 'TKĐ',
                                    name: 'Thanh Khê Đông'
                                },
                                {
                                    id: 'TKT',
                                    name: 'Thanh Khê Tây'
                                },
                                {
                                    id: 'VT',
                                    name: 'Vĩnh Trung'
                                },
                                {
                                    id: 'XH',
                                    name: 'Xuân Hà'
                                }
                            ]
                        },
                        {  
                            id: 'LC'  ,
                            name: 'Liên Chiểu',
                            ward: [
                                {
                                    id: 'HHB',
                                    name: 'Hòa Hiệp Bắc'
                                },
                                {
                                    id: 'HHN',
                                    name: 'Hòa Hiệp Nam'
                                },
                                {
                                    id: 'HKB',
                                    name: 'Hòa Khánh Bắc'
                                },
                                {
                                    id: 'HKN',
                                    name: 'Hòa Khánh Nam'
                                },
                                {
                                    id: 'HM',
                                    name: 'Hòa Minh'
                                }
                            ]
                        },
                        {  
                            id: 'NHS'  ,
                            name: 'Ngũ Hành Sơn',
                            ward: [
                                {
                                    id: 'HH',
                                    name: 'Hòa Hải'
                                },
                                {
                                    id: 'HQ',
                                    name: 'Hòa Quý'
                                },
                                {
                                    id: 'KM',
                                    name: 'Khuê Mỹ'
                                },
                                {
                                    id: 'MA',
                                    name: 'Mỹ An'
                                }
                            ]
                        },
                        {  
                            id: 'ST'  ,
                            name: 'Sơn Trà',
                            ward: [
                                {
                                    id: 'AHĐ',
                                    name: 'An Hải Đông'
                                },
                                {
                                    id: 'AHT',
                                    name: 'An Hải Tây'
                                },
                                {
                                    id: 'PM',
                                    name: 'Phước Mỹ'
                                },
                                {
                                    id: 'AHB',
                                    name: 'An Hải Bắc'
                                },
                                {
                                    id: 'NHĐ',
                                    name: 'Nại Hiên Đông'
                                },
                                {
                                    id: 'MT',
                                    name: 'Mân Thái'
                                },
                                {
                                    id: 'TQ',
                                    name: 'Thọ Quang'
                                }
                            ]
                        },
                        {  
                            id: 'HHV'  ,
                            name: 'Huyện Hòa Vang',
                            ward: [
                                {
                                    id: 'HC',
                                    name: 'Hòa Châu'
                                },
                                {
                                    id: 'HT',
                                    name: 'Hòa Tiến'
                                },
                                {
                                    id: 'HP',
                                    name: 'Hòa Phước'
                                },
                                {
                                    id: 'HP',
                                    name: 'Hòa Phong'
                                },
                                {
                                    id: 'HN',
                                    name: 'Hòa Nhơn'
                                },
                                {
                                    id: 'HK',
                                    name: 'Hòa Khương'
                                },
                                {
                                    id: 'HP',
                                    name: 'Hòa Phú'
                                },
                                {
                                    id: 'HS',
                                    name: 'Hòa Sơn'
                                },
                                {
                                    id: 'HN',
                                    name: 'Hòa Ninh'
                                },
                                {
                                    id: 'HL',
                                    name: 'Hòa Liên'
                                },
                                {
                                    id: 'HB',
                                    name: 'Hòa Bắc'
                                }
                            ]
                        },
                        {  
                            id: 'HHS'  ,
                            name: 'Huyện Hoàng Sa',
                            ward: [
                                {
                                    id: 'đHS',
                                    name: 'đảo Hoàng Sa'
                                },
                                {
                                    id: 'đĐB',
                                    name: 'đảo Đá Bắc'
                                },
                                {
                                    id: 'đHN',
                                    name: 'đảo Hữu Nhật'
                                },
                                {
                                    id: 'đĐL',
                                    name: 'đảo Đá Lồi'
                                },
                                {
                                    id: 'đBQ',
                                    name: 'đảo Bạch Quy'
                                },
                                {
                                    id: 'đTT',
                                    name: 'đảo Tri Tôn'
                                },
                                {
                                    id: 'ĐC',
                                    name: 'Đảo Cây'
                                },
                                {
                                    id: 'đB',
                                    name: 'đảo Bắc'
                                },
                                {
                                    id: 'đG',
                                    name: 'đảo Giữa'
                                },
                                {
                                    id: 'đN',
                                    name: 'đảo Nam'
                                },
                                {
                                    id: 'đPL',
                                    name: 'đảo Phú Lâm'
                                },
                                {
                                    id: 'đLC',
                                    name: 'đảo Linh Côn'
                                },
                                {
                                    id: 'đQH',
                                    name: 'đảo Quang Hòa'
                                },
                                {
                                    id: 'CBB',
                                    name: 'Cồn Bông Bay'
                                },
                                {
                                    id: 'CQS',
                                    name: 'Cồn Quan Sát'
                                },
                                {
                                    id: 'CCT',
                                    name: 'Cồn Cát Tây'
                                },
                                {
                                    id: 'ĐCY',
                                    name: 'Đá Chim Yến'
                                },
                                {
                                    id: 'ĐT',
                                    name: 'Đá Tháp'
                                }
                            ]
                        }
                    ]
                }
            ]
            
        }
    ];

    public readonly COLOR_ERROR = 'red';

    public readonly COLOR_NORMAL = '#dee2e6';
    
}