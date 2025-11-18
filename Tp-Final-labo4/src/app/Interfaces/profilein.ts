
export interface Profile {
    id?:       string,
    username: string,
    date:     Date,
    email:    string,
    cel:      string,
    password: string
}

export interface Review {
    idProfile: number;
  idMovie: number;
  score: number;
  description: string;
}

