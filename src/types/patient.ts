export interface Patient {
  firstname: string;
  lastname: string;
  pid: string;
  sex: string;
  birthday: string;
  _id: string;
  address?: string;
  phone?: string;
  share?: string[];
  creationdate?: string;
  doctor?: string;
  _pid?: string;
  patientid?: string;
}


export interface Record {
  patientid: string;
  checktype: string;
  day: string;
  content: {
    photos: Array<{
      filename: string;
      thumbnail: string;
      originalname: string;
      savedate: string;
      username: string;
    }>;
    type?: string;
    note?: string;
  };
  diagnosed: string;
  recorddate: string;
  doctor: string;
  _id: string;
} 