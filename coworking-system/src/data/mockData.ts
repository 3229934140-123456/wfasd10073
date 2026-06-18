import { User, Resource, Booking, Payment, MonthlyAgreement, Visitor, CommunityPost, CommunityComment, MeetingPackage, DailyAnalytics, ResourceOccupancy, MonthlyBill } from '../types';

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    password: '123456',
    role: 'operator',
    company: '共创空间运营',
    createdAt: '2026-01-01'
  },
  {
    id: 'u2',
    name: '李四',
    email: 'lisi@example.com',
    phone: '13800138002',
    password: '123456',
    role: 'receptionist',
    createdAt: '2026-01-05'
  },
  {
    id: 'u3',
    name: '王五',
    email: 'wangwu@example.com',
    phone: '13800138003',
    password: '123456',
    role: 'resident',
    company: '科技之星有限公司',
    createdAt: '2026-02-01'
  },
  {
    id: 'u4',
    name: '赵六',
    email: 'zhaoliu@example.com',
    phone: '13800138004',
    password: '123456',
    role: 'resident',
    company: '创新科技',
    createdAt: '2026-02-15'
  },
  {
    id: 'u5',
    name: '钱七',
    email: 'qianqi@example.com',
    phone: '13800138005',
    password: '123456',
    role: 'customer',
    createdAt: '2026-03-01'
  },
  {
    id: 'u6',
    name: '孙八',
    email: 'sunba@example.com',
    phone: '13800138006',
    password: '123456',
    role: 'resident',
    company: '数据科学工作室',
    createdAt: '2026-01-20'
  }
];

export const mockResources: Resource[] = [
  {
    id: 'r1',
    name: 'A区开放工位001',
    type: 'desk',
    description: '位于A区一楼靠窗位置，视野开阔，配备人体工学椅',
    location: 'A区-1F-001',
    capacity: 1,
    pricing: { daily: 50, weekly: 280, monthly: 800 },
    minDuration: 1,
    amenities: ['高速WiFi', '电源插座', '储物柜', '人体工学椅'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20coworking%20space%20open%20desk%20area%20with%20natural%20light%20minimalist%20design&image_size=landscape_16_9',
    status: 'available',
    createdAt: '2026-01-01'
  },
  {
    id: 'r2',
    name: 'A区开放工位002',
    type: 'desk',
    description: '位于A区一楼中央区域，靠近茶水间',
    location: 'A区-1F-002',
    capacity: 1,
    pricing: { daily: 50, weekly: 280, monthly: 800 },
    minDuration: 1,
    amenities: ['高速WiFi', '电源插座', '储物柜'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20office%20workspace%20single%20desk%20with%20computer&image_size=landscape_16_9',
    status: 'available',
    createdAt: '2026-01-01'
  },
  {
    id: 'r3',
    name: 'A区开放工位003',
    type: 'desk',
    description: '位于A区一楼安静区，适合专注工作',
    location: 'A区-1F-003',
    capacity: 1,
    pricing: { daily: 50, weekly: 280, monthly: 800 },
    minDuration: 1,
    amenities: ['高速WiFi', '电源插座', '储物柜', '静音区'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=quiet%20workspace%20corner%20desk%20in%20coworking%20office&image_size=landscape_16_9',
    status: 'occupied',
    createdAt: '2026-01-01'
  },
  {
    id: 'r4',
    name: 'B区开放工位001',
    type: 'desk',
    description: '位于B区二楼，景观位置',
    location: 'B区-2F-001',
    capacity: 1,
    pricing: { daily: 60, weekly: 340, monthly: 1000 },
    minDuration: 1,
    amenities: ['高速WiFi', '电源插座', '储物柜', '景观位'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%20coworking%20desk%20with%20city%20view%20large%20windows&image_size=landscape_16_9',
    status: 'available',
    createdAt: '2026-01-15'
  },
  {
    id: 'r5',
    name: '独立办公室A-101',
    type: 'office',
    description: '2人独立办公室，配备办公家具，私密性好',
    location: 'A区-2F-101',
    capacity: 2,
    pricing: { daily: 300, weekly: 1800, monthly: 5000 },
    minDuration: 1,
    amenities: ['高速WiFi', '独立空调', '独立门禁', '办公桌椅', '文件柜'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=small%20private%20office%20room%20two%20people%20modern%20furniture&image_size=landscape_16_9',
    status: 'available',
    createdAt: '2026-01-01'
  },
  {
    id: 'r6',
    name: '独立办公室B-201',
    type: 'office',
    description: '4人独立办公室，玻璃隔断，采光充足',
    location: 'B区-2F-201',
    capacity: 4,
    pricing: { daily: 500, weekly: 3000, monthly: 8500 },
    minDuration: 1,
    amenities: ['高速WiFi', '独立空调', '独立门禁', '会议桌', '白板'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medium%20private%20office%20glass%20walls%204%20person%20team&image_size=landscape_16_9',
    status: 'occupied',
    createdAt: '2026-01-10'
  },
  {
    id: 'r7',
    name: '独立办公室C-301',
    type: 'office',
    description: '8人团队办公室，宽敞明亮，独立卫生间',
    location: 'C区-3F-301',
    capacity: 8,
    pricing: { daily: 900, weekly: 5400, monthly: 15000 },
    minDuration: 7,
    amenities: ['高速WiFi', '独立空调', '独立门禁', '独立卫生间', '茶水间', '投影设备'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=large%20team%20office%20room%208%20people%20spacious%20bright&image_size=landscape_16_9',
    status: 'available',
    createdAt: '2026-02-01'
  },
  {
    id: 'r8',
    name: '小型会议室A1',
    type: 'meetingroom',
    description: '4人小型会议室，适合小组讨论',
    location: 'A区-1F-M1',
    capacity: 4,
    pricing: { daily: 200, weekly: 1200 },
    minDuration: 1,
    amenities: ['高速WiFi', '电视屏幕', '白板', '视频会议设备'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=small%20meeting%20room%204%20people%20glass%20table%20modern&image_size=landscape_16_9',
    status: 'available',
    createdAt: '2026-01-01'
  },
  {
    id: 'r9',
    name: '中型会议室B1',
    type: 'meetingroom',
    description: '10人中型会议室，配备完善会议设备',
    location: 'B区-2F-M1',
    capacity: 10,
    pricing: { daily: 500, weekly: 3000 },
    minDuration: 2,
    amenities: ['高速WiFi', '投影设备', '视频会议系统', '白板', '电话会议'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=medium%20conference%20room%2010%20people%20projector%20screen&image_size=landscape_16_9',
    status: 'available',
    createdAt: '2026-01-01'
  },
  {
    id: 'r10',
    name: '大型路演厅C1',
    type: 'meetingroom',
    description: '30人大型路演厅，适合产品发布、培训活动',
    location: 'C区-1F-M1',
    capacity: 30,
    pricing: { daily: 1200, weekly: 7000 },
    minDuration: 4,
    amenities: ['高速WiFi', '专业投影', '音响系统', '舞台灯光', '直播设备', '茶歇区'],
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=large%20event%20hall%20auditorium%2030%20seats%20presentation&image_size=landscape_16_9',
    status: 'maintenance',
    createdAt: '2026-01-15'
  }
];

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    resourceId: 'r3',
    resourceName: 'A区开放工位003',
    userId: 'u3',
    userName: '王五',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    pricingModel: 'monthly',
    totalPrice: 800,
    status: 'confirmed',
    accessCode: 'AC-001-202606',
    createdAt: '2026-05-25'
  },
  {
    id: 'b2',
    resourceId: 'r6',
    resourceName: '独立办公室B-201',
    userId: 'u4',
    userName: '赵六',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    pricingModel: 'monthly',
    totalPrice: 8500,
    status: 'paid',
    accessCode: 'AC-002-202606',
    createdAt: '2026-05-20'
  },
  {
    id: 'b3',
    resourceId: 'r8',
    resourceName: '小型会议室A1',
    userId: 'u3',
    userName: '王五',
    startDate: '2026-06-18',
    endDate: '2026-06-18',
    pricingModel: 'daily',
    totalPrice: 0,
    status: 'confirmed',
    accessCode: 'AC-003-20260618',
    freeUsageUsed: true,
    createdAt: '2026-06-17'
  },
  {
    id: 'b4',
    resourceId: 'r1',
    resourceName: 'A区开放工位001',
    userId: 'u5',
    userName: '钱七',
    startDate: '2026-06-18',
    endDate: '2026-06-20',
    pricingModel: 'daily',
    totalPrice: 150,
    status: 'paid',
    accessCode: 'AC-004-20260618',
    createdAt: '2026-06-17'
  },
  {
    id: 'b5',
    resourceId: 'r9',
    resourceName: '中型会议室B1',
    userId: 'u4',
    userName: '赵六',
    startDate: '2026-06-19',
    endDate: '2026-06-19',
    pricingModel: 'daily',
    totalPrice: 500,
    status: 'confirmed',
    accessCode: 'AC-005-20260619',
    createdAt: '2026-06-16'
  },
  {
    id: 'b6',
    resourceId: 'r2',
    resourceName: 'A区开放工位002',
    userId: 'u6',
    userName: '孙八',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    pricingModel: 'monthly',
    totalPrice: 800,
    status: 'confirmed',
    accessCode: 'AC-006-202606',
    createdAt: '2026-05-28'
  }
];

export const mockPayments: Payment[] = [
  {
    id: 'p1',
    bookingId: 'b2',
    userId: 'u4',
    userName: '赵六',
    amount: 8500,
    method: 'monthly',
    status: 'paid',
    settlementStatus: 'paid',
    billMonth: '2026-06',
    description: '2026年6月 独立办公室B-201月租',
    paidAt: '2026-05-20',
    createdAt: '2026-05-20'
  },
  {
    id: 'p2',
    bookingId: 'b4',
    userId: 'u5',
    userName: '钱七',
    amount: 150,
    method: 'online',
    status: 'paid',
    billMonth: '2026-06',
    description: 'A区开放工位001 三天日租',
    paidAt: '2026-06-17',
    createdAt: '2026-06-17'
  },
  {
    id: 'p3',
    userId: 'u3',
    userName: '王五',
    amount: 800,
    method: 'monthly',
    status: 'paid',
    settlementStatus: 'paid',
    billMonth: '2026-06',
    description: '2026年6月 A区开放工位003月租',
    paidAt: '2026-05-25',
    createdAt: '2026-05-25'
  },
  {
    id: 'p4',
    bookingId: 'b5',
    userId: 'u4',
    userName: '赵六',
    amount: 500,
    method: 'monthly',
    status: 'pending',
    settlementStatus: 'pending',
    billMonth: '2026-06',
    description: '中型会议室B1 日租',
    createdAt: '2026-06-16'
  },
  {
    id: 'p5',
    userId: 'u6',
    userName: '孙八',
    amount: 800,
    method: 'monthly',
    status: 'paid',
    settlementStatus: 'paid',
    billMonth: '2026-06',
    description: '2026年6月 A区开放工位002月租',
    paidAt: '2026-05-28',
    createdAt: '2026-05-28'
  },
  {
    id: 'p6',
    userId: 'u3',
    userName: '王五',
    amount: 300,
    method: 'monthly',
    status: 'pending',
    settlementStatus: 'pending',
    billMonth: '2026-06',
    description: '中型会议室B1 超额使用3小时',
    createdAt: '2026-06-18'
  },
  {
    id: 'p7',
    userId: 'u3',
    userName: '王五',
    amount: 800,
    method: 'monthly',
    status: 'paid',
    settlementStatus: 'paid',
    billMonth: '2026-05',
    description: '2026年5月 A区开放工位003月租',
    paidAt: '2026-04-28',
    createdAt: '2026-04-28'
  }
];

export const mockMonthlyBills: MonthlyBill[] = [
  {
    id: 'bill1',
    userId: 'u3',
    userName: '王五',
    company: '科技之星有限公司',
    agreementId: 'a1',
    month: '2026-05',
    baseFee: 800,
    meetingExtraFee: 0,
    adhocBookingFee: 0,
    totalAmount: 800,
    paidAmount: 800,
    settlementStatus: 'paid',
    confirmedAt: '2026-05-01',
    paidAt: '2026-04-28',
    items: [
      {
        id: 'bi1',
        type: 'base',
        description: '月度协议租金（A区开放工位003）',
        amount: 800,
        referenceId: 'a1',
        createdAt: '2026-05-01'
      }
    ],
    createdAt: '2026-05-01'
  },
  {
    id: 'bill2',
    userId: 'u3',
    userName: '王五',
    company: '科技之星有限公司',
    agreementId: 'a1',
    month: '2026-06',
    baseFee: 800,
    meetingExtraFee: 300,
    adhocBookingFee: 0,
    totalAmount: 1100,
    paidAmount: 800,
    settlementStatus: 'pending',
    confirmedAt: undefined,
    paidAt: undefined,
    items: [
      {
        id: 'bi2',
        type: 'base',
        description: '月度协议租金（A区开放工位003）',
        amount: 800,
        referenceId: 'a1',
        createdAt: '2026-06-01'
      },
      {
        id: 'bi3',
        type: 'meeting_extra',
        description: '会议室超额使用3小时 × ¥100',
        amount: 300,
        quantity: 3,
        unitPrice: 100,
        referenceId: 'mp1',
        createdAt: '2026-06-18'
      }
    ],
    createdAt: '2026-06-01'
  },
  {
    id: 'bill3',
    userId: 'u4',
    userName: '赵六',
    company: '创新科技',
    agreementId: 'a2',
    month: '2026-06',
    baseFee: 8500,
    meetingExtraFee: 0,
    adhocBookingFee: 500,
    totalAmount: 9000,
    paidAmount: 8500,
    settlementStatus: 'pending',
    items: [
      {
        id: 'bi4',
        type: 'base',
        description: '月度协议租金（独立办公室B-201）',
        amount: 8500,
        referenceId: 'a2',
        createdAt: '2026-06-01'
      },
      {
        id: 'bi5',
        type: 'booking',
        description: '中型会议室B1（2026-06-16 09:00 ~ 2026-06-16 18:00）',
        amount: 500,
        referenceId: 'b5',
        createdAt: '2026-06-16'
      }
    ],
    createdAt: '2026-06-01'
  },
  {
    id: 'bill4',
    userId: 'u6',
    userName: '孙八',
    company: '数据科学工作室',
    agreementId: 'a3',
    month: '2026-06',
    baseFee: 800,
    meetingExtraFee: 0,
    adhocBookingFee: 0,
    totalAmount: 800,
    paidAmount: 800,
    settlementStatus: 'paid',
    paidAt: '2026-05-28',
    confirmedAt: '2026-06-01',
    items: [
      {
        id: 'bi6',
        type: 'base',
        description: '月度协议租金（A区开放工位002）',
        amount: 800,
        referenceId: 'a3',
        createdAt: '2026-06-01'
      }
    ],
    createdAt: '2026-06-01'
  }
];

export const mockAgreements: MonthlyAgreement[] = [
  {
    id: 'a1',
    userId: 'u3',
    userName: '王五',
    company: '科技之星有限公司',
    resourceId: 'r3',
    resourceName: 'A区开放工位003',
    monthlyFee: 800,
    startDate: '2026-06-01',
    endDate: '2026-11-30',
    freeMeetingHours: 20,
    usedMeetingHours: 4,
    status: 'active',
    createdAt: '2026-05-25'
  },
  {
    id: 'a2',
    userId: 'u4',
    userName: '赵六',
    company: '创新科技',
    resourceId: 'r6',
    resourceName: '独立办公室B-201',
    monthlyFee: 8500,
    startDate: '2026-06-01',
    endDate: '2027-05-31',
    freeMeetingHours: 40,
    usedMeetingHours: 8,
    status: 'active',
    createdAt: '2026-05-20'
  },
  {
    id: 'a3',
    userId: 'u6',
    userName: '孙八',
    company: '数据科学工作室',
    resourceId: 'r2',
    resourceName: 'A区开放工位002',
    monthlyFee: 800,
    startDate: '2026-06-01',
    endDate: '2026-12-31',
    freeMeetingHours: 20,
    usedMeetingHours: 2,
    status: 'active',
    createdAt: '2026-05-28'
  }
];

export const mockMeetingPackages: MeetingPackage[] = [
  {
    id: 'mp1',
    userId: 'u3',
    userName: '王五',
    agreementId: 'a1',
    freeHours: 20,
    usedHours: 4,
    extraHours: 0,
    extraHourRate: 80,
    month: '2026-06'
  },
  {
    id: 'mp2',
    userId: 'u4',
    userName: '赵六',
    agreementId: 'a2',
    freeHours: 40,
    usedHours: 8,
    extraHours: 2,
    extraHourRate: 100,
    month: '2026-06'
  },
  {
    id: 'mp3',
    userId: 'u6',
    userName: '孙八',
    agreementId: 'a3',
    freeHours: 20,
    usedHours: 2,
    extraHours: 0,
    extraHourRate: 80,
    month: '2026-06'
  }
];

export const mockVisitors: Visitor[] = [
  {
    id: 'v1',
    name: '访客A',
    phone: '13900139001',
    company: '拜访公司A',
    residentId: 'u3',
    residentName: '王五',
    purpose: '商务洽谈',
    checkIn: '2026-06-18 09:30',
    status: 'waiting',
    notified: true,
    createdAt: '2026-06-18 09:28'
  },
  {
    id: 'v2',
    name: '访客B',
    phone: '13900139002',
    residentId: 'u4',
    residentName: '赵六',
    purpose: '面试',
    checkIn: '2026-06-18 10:00',
    checkOut: '2026-06-18 11:30',
    status: 'checkedout',
    notified: true,
    createdAt: '2026-06-18 09:55'
  },
  {
    id: 'v3',
    name: '访客C',
    phone: '13900139003',
    company: '合作公司B',
    residentId: 'u6',
    residentName: '孙八',
    purpose: '项目合作',
    checkIn: '2026-06-18 14:00',
    status: 'checkedin',
    notified: true,
    createdAt: '2026-06-18 13:58'
  }
];

export const mockPosts: CommunityPost[] = [
  {
    id: 'cp1',
    userId: 'u4',
    userName: '赵六',
    company: '创新科技',
    type: 'recruitment',
    title: '【招聘】诚聘高级前端工程师',
    content: '我们是创新科技，目前正在快速发展阶段，诚招2名高级前端工程师。\n\n要求：\n- 3年以上React/Vue开发经验\n- 熟悉TypeScript\n- 有大型项目经验优先\n\n待遇：\n- 薪资25-40K\n- 五险一金\n- 14薪\n\n有意向的邻居欢迎来B-201面谈，或投递简历到hr@innovtech.com',
    contactInfo: 'hr@innovtech.com',
    tags: ['前端', 'React', '招聘'],
    createdAt: '2026-06-15 10:00'
  },
  {
    id: 'cp2',
    userId: 'u3',
    userName: '王五',
    company: '科技之星有限公司',
    type: 'cooperation',
    title: '【合作】寻找小程序开发合作伙伴',
    content: '我司有一个企业级小程序项目，需要寻找有经验的开发团队合作。\n\n项目简介：\n- 面向中小企业的客户管理系统\n- 预计开发周期2个月\n- 预算充裕\n\n希望合作伙伴：\n- 有丰富的小程序开发经验\n- 能够独立完成UI设计到开发上线\n- 驻场办公优先\n\n感兴趣的欢迎来A区-003工位详谈，或加微信：techstar_wang',
    contactInfo: '微信：techstar_wang',
    tags: ['小程序', '合作', '外包'],
    createdAt: '2026-06-16 14:30'
  },
  {
    id: 'cp3',
    userId: 'u6',
    userName: '孙八',
    company: '数据科学工作室',
    type: 'recruitment',
    title: '【招聘】招一名数据分析师实习',
    content: '数据科学工作室招聘实习生一名，主要工作内容：\n1. 协助数据清洗和整理\n2. 参与数据可视化报表制作\n3. 学习并实践数据分析方法论\n\n要求：\n- 统计、数学、计算机相关专业在读\n- 熟悉SQL和Python基础\n- 每周至少到岗3天\n\n待遇：日薪200元，表现优异可转正。\n请发送简历到 datascience@studio.com',
    contactInfo: 'datascience@studio.com',
    tags: ['实习', '数据分析', 'Python'],
    createdAt: '2026-06-17 09:15'
  },
  {
    id: 'cp4',
    userId: 'u4',
    userName: '赵六',
    company: '创新科技',
    type: 'cooperation',
    title: '【资源共享】我们有闲置的设计资源',
    content: '各位邻居好！\n\n我们团队有一名资深UI设计师，目前工作量不饱和，可以为大家提供以下服务：\n- 官网/落地页设计\n- App界面设计\n- Logo/VI设计\n- PPT美化\n\n给邻居们打8折！有需要的欢迎随时来B-201咨询。',
    contactInfo: 'B-201 直接找赵六',
    tags: ['设计', 'UI', '资源共享'],
    createdAt: '2026-06-17 16:00'
  }
];

export const mockComments: CommunityComment[] = [
  {
    id: 'cc1',
    postId: 'cp1',
    userId: 'u6',
    userName: '孙八',
    content: '薪资范围很有竞争力！我有个朋友正好在找工作，帮你们推荐一下~',
    createdAt: '2026-06-15 11:20'
  },
  {
    id: 'cc2',
    postId: 'cp1',
    userId: 'u3',
    userName: '王五',
    content: '同问，需要后端吗？我们团队也有朋友在找机会。',
    createdAt: '2026-06-15 14:05'
  },
  {
    id: 'cc3',
    postId: 'cp2',
    userId: 'u4',
    userName: '赵六',
    content: '我们团队做过几个小程序，可以聊聊看！',
    createdAt: '2026-06-16 15:30'
  }
];

export const mockDailyAnalytics: DailyAnalytics[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date('2026-06-01');
  date.setDate(date.getDate() + i);
  const dateStr = date.toISOString().slice(0, 10);
  const revenue = 800 + Math.floor(Math.random() * 4000);
  const bookings = 2 + Math.floor(Math.random() * 8);
  return { date: dateStr, revenue, bookings };
});

export const mockResourceOccupancy: ResourceOccupancy[] = [
  { resourceId: 'r1', resourceName: 'A区开放工位001', type: 'desk', occupiedDays: 12, totalDays: 30, occupancyRate: 40, vacancyRate: 60, revenue: 2400 },
  { resourceId: 'r2', resourceName: 'A区开放工位002', type: 'desk', occupiedDays: 30, totalDays: 30, occupancyRate: 100, vacancyRate: 0, revenue: 800 },
  { resourceId: 'r3', resourceName: 'A区开放工位003', type: 'desk', occupiedDays: 30, totalDays: 30, occupancyRate: 100, vacancyRate: 0, revenue: 800 },
  { resourceId: 'r4', resourceName: 'B区开放工位001', type: 'desk', occupiedDays: 8, totalDays: 30, occupancyRate: 26.7, vacancyRate: 73.3, revenue: 1920 },
  { resourceId: 'r5', resourceName: '独立办公室A-101', type: 'office', occupiedDays: 10, totalDays: 30, occupancyRate: 33.3, vacancyRate: 66.7, revenue: 15000 },
  { resourceId: 'r6', resourceName: '独立办公室B-201', type: 'office', occupiedDays: 30, totalDays: 30, occupancyRate: 100, vacancyRate: 0, revenue: 8500 },
  { resourceId: 'r7', resourceName: '独立办公室C-301', type: 'office', occupiedDays: 0, totalDays: 30, occupancyRate: 0, vacancyRate: 100, revenue: 0 },
  { resourceId: 'r8', resourceName: '小型会议室A1', type: 'meetingroom', occupiedDays: 18, totalDays: 30, occupancyRate: 60, vacancyRate: 40, revenue: 3600 },
  { resourceId: 'r9', resourceName: '中型会议室B1', type: 'meetingroom', occupiedDays: 12, totalDays: 30, occupancyRate: 40, vacancyRate: 60, revenue: 6000 },
  { resourceId: 'r10', resourceName: '大型路演厅C1', type: 'meetingroom', occupiedDays: 3, totalDays: 30, occupancyRate: 10, vacancyRate: 90, revenue: 3600 }
];
