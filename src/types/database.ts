export interface MediaFile {
  _id: string;
  filename: string;
  originalname: string;
  thumbnail: string;
}

export interface Patient {
  _id: string;
  firstname: string;
  lastname: string;
  pid: string;
  sex: string;
  birthday: string;
}

export interface Record {
  _id: string;
  patientid: string;
  content: {
    photos: Array<{
      filename: string;
      type?: string;
    }>;
  };
}

export interface QualityCheck {
  model_coef?: number;
  model_response?: string;
}