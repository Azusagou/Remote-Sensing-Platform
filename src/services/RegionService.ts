import axios from 'axios';

// 区域类型定义
export interface Region {
  code: string;
  name: string;
  children?: Region[];
}

// 缓存区域数据
let regionCache: {
  provinces: Region[];
  cities: Record<string, Region[]>;
  districts: Record<string, Region[]>;
} = {
  provinces: [],
  cities: {},
  districts: {}
};

/**
 * 获取所有省份数据
 * @returns 省份列表
 */
export const getProvinces = async (): Promise<Region[]> => {
  // 如果缓存中有数据，直接返回
  if (regionCache.provinces.length > 0) {
    return regionCache.provinces;
  }
  
  try {
    // 实际项目中，这里应该是从API获取数据
    // 这里模拟API调用，返回静态数据
    // const response = await axios.get('/api/regions/provinces');
    // regionCache.provinces = response.data;
    
    // 模拟数据
    regionCache.provinces = [
      { code: '110000', name: '北京市' },
      { code: '120000', name: '天津市' },
      { code: '130000', name: '河北省' },
      { code: '140000', name: '山西省' },
      { code: '150000', name: '内蒙古自治区' },
      { code: '210000', name: '辽宁省' },
      { code: '220000', name: '吉林省' },
      { code: '230000', name: '黑龙江省' },
      { code: '310000', name: '上海市' },
      { code: '320000', name: '江苏省' },
      { code: '330000', name: '浙江省' },
      { code: '340000', name: '安徽省' },
      { code: '350000', name: '福建省' },
      { code: '360000', name: '江西省' },
      { code: '370000', name: '山东省' },
      { code: '410000', name: '河南省' },
      { code: '420000', name: '湖北省' },
      { code: '430000', name: '湖南省' },
      { code: '440000', name: '广东省' },
      { code: '450000', name: '广西壮族自治区' },
      { code: '460000', name: '海南省' },
      { code: '500000', name: '重庆市' },
      { code: '510000', name: '四川省' },
      { code: '520000', name: '贵州省' },
      { code: '530000', name: '云南省' },
      { code: '540000', name: '西藏自治区' },
      { code: '610000', name: '陕西省' },
      { code: '620000', name: '甘肃省' },
      { code: '630000', name: '青海省' },
      { code: '640000', name: '宁夏回族自治区' },
      { code: '650000', name: '新疆维吾尔自治区' },
      { code: '710000', name: '台湾省' },
      { code: '810000', name: '香港特别行政区' },
      { code: '820000', name: '澳门特别行政区' }
    ];
    
    return regionCache.provinces;
  } catch (error) {
    console.error('获取省份数据失败:', error);
    return [];
  }
};

/**
 * 获取指定省份的城市数据
 * @param provinceCode 省份代码
 * @returns 城市列表
 */
export const getCities = async (provinceCode: string): Promise<Region[]> => {
  // 如果缓存中有数据，直接返回
  if (regionCache.cities[provinceCode]) {
    return regionCache.cities[provinceCode];
  }
  
  try {
    // 实际项目中，这里应该是从API获取数据
    // 这里模拟API调用，返回静态数据
    // const response = await axios.get(`/api/regions/cities?provinceCode=${provinceCode}`);
    // regionCache.cities[provinceCode] = response.data;
    
    // 模拟数据 - 这里提供了更多省份的城市数据
    const citiesData: Record<string, Region[]> = {
      '110000': [{ code: '110100', name: '北京市' }],
      '120000': [{ code: '120100', name: '天津市' }],
      '130000': [
        { code: '130100', name: '石家庄市' },
        { code: '130200', name: '唐山市' },
        { code: '130300', name: '秦皇岛市' },
        { code: '130400', name: '邯郸市' },
        { code: '130500', name: '邢台市' },
        { code: '130600', name: '保定市' },
        { code: '130700', name: '张家口市' },
        { code: '130800', name: '承德市' },
        { code: '130900', name: '沧州市' },
        { code: '131000', name: '廊坊市' },
        { code: '131100', name: '衡水市' }
      ],
      '140000': [
        { code: '140100', name: '太原市' },
        { code: '140200', name: '大同市' },
        { code: '140300', name: '阳泉市' },
        { code: '140400', name: '长治市' },
        { code: '140500', name: '晋城市' },
        { code: '140600', name: '朔州市' },
        { code: '140700', name: '晋中市' },
        { code: '140800', name: '运城市' },
        { code: '140900', name: '忻州市' },
        { code: '141000', name: '临汾市' },
        { code: '141100', name: '吕梁市' }
      ],
      '310000': [{ code: '310100', name: '上海市' }],
      '320000': [
        { code: '320100', name: '南京市' },
        { code: '320200', name: '无锡市' },
        { code: '320300', name: '徐州市' },
        { code: '320400', name: '常州市' },
        { code: '320500', name: '苏州市' },
        { code: '320600', name: '南通市' },
        { code: '320700', name: '连云港市' },
        { code: '320800', name: '淮安市' },
        { code: '320900', name: '盐城市' },
        { code: '321000', name: '扬州市' },
        { code: '321100', name: '镇江市' },
        { code: '321200', name: '泰州市' },
        { code: '321300', name: '宿迁市' }
      ],
      '330000': [
        { code: '330100', name: '杭州市' },
        { code: '330200', name: '宁波市' },
        { code: '330300', name: '温州市' },
        { code: '330400', name: '嘉兴市' },
        { code: '330500', name: '湖州市' },
        { code: '330600', name: '绍兴市' },
        { code: '330700', name: '金华市' },
        { code: '330800', name: '衢州市' },
        { code: '330900', name: '舟山市' },
        { code: '331000', name: '台州市' },
        { code: '331100', name: '丽水市' }
      ],
      '340000': [
        { code: '340100', name: '合肥市' },
        { code: '340200', name: '芜湖市' },
        { code: '340300', name: '蚌埠市' },
        { code: '340400', name: '淮南市' },
        { code: '340500', name: '马鞍山市' },
        { code: '340600', name: '淮北市' },
        { code: '340700', name: '铜陵市' },
        { code: '340800', name: '安庆市' },
        { code: '341000', name: '黄山市' },
        { code: '341100', name: '滁州市' },
        { code: '341200', name: '阜阳市' },
        { code: '341300', name: '宿州市' },
        { code: '341500', name: '六安市' },
        { code: '341600', name: '亳州市' },
        { code: '341700', name: '池州市' },
        { code: '341800', name: '宣城市' }
      ],
      '440000': [
        { code: '440100', name: '广州市' },
        { code: '440200', name: '韶关市' },
        { code: '440300', name: '深圳市' },
        { code: '440400', name: '珠海市' },
        { code: '440500', name: '汕头市' },
        { code: '440600', name: '佛山市' },
        { code: '440700', name: '江门市' },
        { code: '440800', name: '湛江市' },
        { code: '440900', name: '茂名市' },
        { code: '441200', name: '肇庆市' },
        { code: '441300', name: '惠州市' },
        { code: '441400', name: '梅州市' },
        { code: '441500', name: '汕尾市' },
        { code: '441600', name: '河源市' },
        { code: '441700', name: '阳江市' },
        { code: '441800', name: '清远市' },
        { code: '441900', name: '东莞市' },
        { code: '442000', name: '中山市' },
        { code: '445100', name: '潮州市' },
        { code: '445200', name: '揭阳市' },
        { code: '445300', name: '云浮市' }
      ],
      '500000': [{ code: '500100', name: '重庆市' }]
    };
    
    // 如果没有该省份的城市数据，返回默认数据
    if (!citiesData[provinceCode]) {
      regionCache.cities[provinceCode] = [
        { code: `${provinceCode.substring(0, 2)}0100`, name: '城市1' },
        { code: `${provinceCode.substring(0, 2)}0200`, name: '城市2' },
        { code: `${provinceCode.substring(0, 2)}0300`, name: '城市3' },
        { code: `${provinceCode.substring(0, 2)}0400`, name: '城市4' },
        { code: `${provinceCode.substring(0, 2)}0500`, name: '城市5' }
      ];
    } else {
      regionCache.cities[provinceCode] = citiesData[provinceCode];
    }
    
    return regionCache.cities[provinceCode];
  } catch (error) {
    console.error(`获取${provinceCode}的城市数据失败:`, error);
    return [];
  }
};

/**
 * 获取指定城市的区县数据
 * @param cityCode 城市代码
 * @returns 区县列表
 */
export const getDistricts = async (cityCode: string): Promise<Region[]> => {
  // 如果缓存中有数据，直接返回
  if (regionCache.districts[cityCode]) {
    return regionCache.districts[cityCode];
  }
  
  try {
    // 实际项目中，这里应该是从API获取数据
    // 这里模拟API调用，返回静态数据
    // const response = await axios.get(`/api/regions/districts?cityCode=${cityCode}`);
    // regionCache.districts[cityCode] = response.data;
    
    // 模拟数据 - 这里提供了更多城市的区县数据
    const districtsData: Record<string, Region[]> = {
      '110100': [
        { code: '110101', name: '东城区' },
        { code: '110102', name: '西城区' },
        { code: '110105', name: '朝阳区' },
        { code: '110106', name: '丰台区' },
        { code: '110107', name: '石景山区' },
        { code: '110108', name: '海淀区' },
        { code: '110109', name: '门头沟区' },
        { code: '110111', name: '房山区' },
        { code: '110112', name: '通州区' },
        { code: '110113', name: '顺义区' },
        { code: '110114', name: '昌平区' },
        { code: '110115', name: '大兴区' },
        { code: '110116', name: '怀柔区' },
        { code: '110117', name: '平谷区' },
        { code: '110118', name: '密云区' },
        { code: '110119', name: '延庆区' }
      ],
      '120100': [
        { code: '120101', name: '和平区' },
        { code: '120102', name: '河东区' },
        { code: '120103', name: '河西区' },
        { code: '120104', name: '南开区' },
        { code: '120105', name: '河北区' },
        { code: '120106', name: '红桥区' },
        { code: '120110', name: '东丽区' },
        { code: '120111', name: '西青区' },
        { code: '120112', name: '津南区' },
        { code: '120113', name: '北辰区' },
        { code: '120114', name: '武清区' },
        { code: '120115', name: '宝坻区' },
        { code: '120116', name: '滨海新区' },
        { code: '120117', name: '宁河区' },
        { code: '120118', name: '静海区' },
        { code: '120119', name: '蓟州区' }
      ],
      '130100': [
        { code: '130102', name: '长安区' },
        { code: '130104', name: '桥西区' },
        { code: '130105', name: '新华区' },
        { code: '130107', name: '井陉矿区' },
        { code: '130108', name: '裕华区' },
        { code: '130109', name: '藁城区' },
        { code: '130110', name: '鹿泉区' },
        { code: '130111', name: '栾城区' },
        { code: '130121', name: '井陉县' },
        { code: '130123', name: '正定县' },
        { code: '130125', name: '行唐县' },
        { code: '130126', name: '灵寿县' },
        { code: '130127', name: '高邑县' },
        { code: '130128', name: '深泽县' },
        { code: '130129', name: '赞皇县' },
        { code: '130130', name: '无极县' },
        { code: '130131', name: '平山县' },
        { code: '130132', name: '元氏县' },
        { code: '130133', name: '赵县' },
        { code: '130181', name: '辛集市' },
        { code: '130183', name: '晋州市' },
        { code: '130184', name: '新乐市' }
      ],
      '310100': [
        { code: '310101', name: '黄浦区' },
        { code: '310104', name: '徐汇区' },
        { code: '310105', name: '长宁区' },
        { code: '310106', name: '静安区' },
        { code: '310107', name: '普陀区' },
        { code: '310108', name: '虹口区' },
        { code: '310109', name: '杨浦区' },
        { code: '310110', name: '闵行区' },
        { code: '310112', name: '闵行区' },
        { code: '310113', name: '宝山区' },
        { code: '310114', name: '嘉定区' },
        { code: '310115', name: '浦东新区' },
        { code: '310116', name: '金山区' },
        { code: '310117', name: '松江区' },
        { code: '310118', name: '青浦区' },
        { code: '310120', name: '奉贤区' },
        { code: '310151', name: '崇明区' }
      ],
      '320100': [
        { code: '320102', name: '玄武区' },
        { code: '320104', name: '秦淮区' },
        { code: '320105', name: '建邺区' },
        { code: '320106', name: '鼓楼区' },
        { code: '320111', name: '浦口区' },
        { code: '320113', name: '栖霞区' },
        { code: '320114', name: '雨花台区' },
        { code: '320115', name: '江宁区' },
        { code: '320116', name: '六合区' },
        { code: '320117', name: '溧水区' },
        { code: '320118', name: '高淳区' }
      ],
      '320500': [
        { code: '320505', name: '虎丘区' },
        { code: '320506', name: '吴中区' },
        { code: '320507', name: '相城区' },
        { code: '320508', name: '姑苏区' },
        { code: '320509', name: '吴江区' },
        { code: '320581', name: '常熟市' },
        { code: '320582', name: '张家港市' },
        { code: '320583', name: '昆山市' },
        { code: '320585', name: '太仓市' }
      ],
      '330100': [
        { code: '330102', name: '上城区' },
        { code: '330103', name: '下城区' },
        { code: '330104', name: '江干区' },
        { code: '330105', name: '拱墅区' },
        { code: '330106', name: '西湖区' },
        { code: '330108', name: '滨江区' },
        { code: '330109', name: '萧山区' },
        { code: '330110', name: '余杭区' },
        { code: '330111', name: '富阳区' },
        { code: '330112', name: '临安区' },
        { code: '330122', name: '桐庐县' },
        { code: '330127', name: '淳安县' },
        { code: '330182', name: '建德市' }
      ],
      '440100': [
        { code: '440103', name: '荔湾区' },
        { code: '440104', name: '越秀区' },
        { code: '440105', name: '海珠区' },
        { code: '440106', name: '天河区' },
        { code: '440111', name: '白云区' },
        { code: '440112', name: '黄埔区' },
        { code: '440113', name: '番禺区' },
        { code: '440114', name: '花都区' },
        { code: '440115', name: '南沙区' },
        { code: '440117', name: '从化区' },
        { code: '440118', name: '增城区' }
      ],
      '440300': [
        { code: '440303', name: '罗湖区' },
        { code: '440304', name: '福田区' },
        { code: '440305', name: '南山区' },
        { code: '440306', name: '宝安区' },
        { code: '440307', name: '龙岗区' },
        { code: '440308', name: '盐田区' },
        { code: '440309', name: '龙华区' },
        { code: '440310', name: '坪山区' },
        { code: '440311', name: '光明区' }
      ]
    };
    
    // 如果没有该城市的区县数据，返回默认数据
    if (!districtsData[cityCode]) {
      regionCache.districts[cityCode] = [
        { code: `${cityCode.substring(0, 4)}01`, name: '区县1' },
        { code: `${cityCode.substring(0, 4)}02`, name: '区县2' },
        { code: `${cityCode.substring(0, 4)}03`, name: '区县3' },
        { code: `${cityCode.substring(0, 4)}04`, name: '区县4' },
        { code: `${cityCode.substring(0, 4)}05`, name: '区县5' }
      ];
    } else {
      regionCache.districts[cityCode] = districtsData[cityCode];
    }
    
    return regionCache.districts[cityCode];
  } catch (error) {
    console.error(`获取${cityCode}的区县数据失败:`, error);
    return [];
  }
};

/**
 * 根据代码获取区域名称
 * @param code 区域代码
 * @returns 区域名称
 */
export const getRegionNameByCode = (code: string): string => {
  // 检查省份
  const province = regionCache.provinces.find(p => p.code === code);
  if (province) {
    return province.name;
  }
  
  // 检查城市
  for (const provinceCode in regionCache.cities) {
    const city = regionCache.cities[provinceCode].find(c => c.code === code);
    if (city) {
      return city.name;
    }
  }
  
  // 检查区县
  for (const cityCode in regionCache.districts) {
    const district = regionCache.districts[cityCode].find(d => d.code === code);
    if (district) {
      return district.name;
    }
  }
  
  return '';
};

export default {
  getProvinces,
  getCities,
  getDistricts,
  getRegionNameByCode
}; 