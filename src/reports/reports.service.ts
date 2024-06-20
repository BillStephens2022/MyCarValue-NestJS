import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Report } from './report.entity';
import { CreateReportDto } from './dtos/create-report.dto';
import { User } from '../users/user.entity';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  createEstimate({ make, model, lng, lat, year, mileage }: GetEstimateDto) {
    return this.repo
      .createQueryBuilder()
      .select('AVG(price)', 'price')  // select the average price
      .where('make = :make', { make })
      .andWhere('model = :model', { model })
      .andWhere('lng - :lng BETWEEN -5 and 5', { lng })  // check if the lng is within 5 degrees of the provided lng
      .andWhere('lat - :lat BETWEEN -5 and 5', { lat })  // check if the lat is within 5 degrees of the provided lat
      .andWhere('year - :year BETWEEN -3 and 3', { year })  // check if the year is within 3 years of the provided year
      .andWhere('approved IS TRUE')  // check if the report is approved by an admin
      .orderBy('ABS(mileage - :mileage)', 'DESC')  // order by the difference between the mileage and the provided mileage
      .setParameters({ mileage })  // set the mileage parameter
      .limit(3)  // limit the results to 3
      .getRawOne();
  }

  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);  
    report.user = user;  // add the current user to the report
    return this.repo.save(report);  // saves to the database
  }

  async changeApproval(id: string, approved: boolean) {
    const report = await this.repo.findOne({ where: { id: parseInt(id) } });
    if (!report) {
      throw new NotFoundException('report not found');
    }
    report.approved = approved;
    return this.repo.save(report);
  }
}
