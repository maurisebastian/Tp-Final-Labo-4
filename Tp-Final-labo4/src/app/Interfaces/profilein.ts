export interface Profilein {
     profiles: Profile[],
    review:   Review[]
}

export interface Profile {
    id?:       string,
    username: string,
    date:     Date,
    email:    string,
    cel:      string,
    password: string
}

export interface Review {
    idProfile:   string,
    idMovie:     string,
    score:       string,
    description: string
}

