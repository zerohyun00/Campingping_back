import { Geometry } from "typeorm";

export class FindResponseDto {
    id: number;
    title: string;
    content: string;
    location: string;
    people: number;
    startdate: Date;
    enddate: Date;
    view: number;
    createdAt: Date;
    updatedAt: Date;
    coordinate: string;
    distance: number;
    user: {email:string, nickname: string}
    
    constructor(community: any) {
        this.id = community.id
        this.title = community.title
        this.content = community.content
        this.location = community.location
        this.people = community.people
        this.startdate = community.startDate
        this.enddate = community.endDate
        this.view = community.view
        this.createdAt = community.createdat
        this.updatedAt = community.createdat
        this.distance = community.distance
        try {
            this.coordinate = JSON.parse(community.coordinate)
        } catch (error) {
            console.error("에러입니다", error.message);
        }
        this.user = {email: community.email, nickname: community.nickname}
    }
    static allList(community: any[]): FindResponseDto[]{
        return community.map((community) => new FindResponseDto(community));
    }
}
