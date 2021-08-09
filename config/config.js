
import { Platform,Dimensions} from 'react-native';
// export const API_URL = Platform.OS === 'ios' ? 'https://pikselpartybackend.herokuapp.com/users' : 'https://192.168.111.182:4000/users';
export const API_URL = Platform.OS === 'ios' ? 'https://pikselpartybackend.herokuapp.com/users' : 'https://pikselpartybackend.herokuapp.com/users';

export const STORAGE_KEY = "@PikselParty:2021";

export const default_photo = 'https://res.cloudinary.com/dpyy2o3xv/image/upload/v1628108228/selfie_1_pqb53z.png';
export const upload_url = 'https://api.cloudinary.com/v1_1/dpyy2o3xv/image/upload';
export const upload_preset = 'uliks_upload';

export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;