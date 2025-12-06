import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AnalyticsTaskEntity } from 'src/entities/finance/analytics-task.entity';
import { AnalyticsService } from '../services/analytics.service';
import { AnalyticsRequestInput } from '../inputs/analytics-request.input';
import { AnalyticsFilterInput } from '../inputs/analytics-filter.input';
import { CurrentUser } from 'src/decorators/auth/current-user.decorator';
import { JwtPayload } from 'src/modules/auth/jwt-payload.interface';

@Resolver(() => AnalyticsTaskEntity)
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Mutation(() => AnalyticsTaskEntity, {
    description: 'Создание задачи финансовой аналитики',
  })
  createAnalytics(
    @CurrentUser() user: JwtPayload,
    @Args('input', { description: 'Данные для запроса аналитики' })
    input: AnalyticsRequestInput,
  ): Promise<AnalyticsTaskEntity> {
    return this.analyticsService.createTask(user.sub, input);
  }

  @Query(() => AnalyticsTaskEntity, {
    description: 'Получение задачи аналитики по идентификатору',
  })
  analyticsTask(
    @CurrentUser() user: JwtPayload,
    @Args('id', { description: 'Идентификатор задачи' }) id: string,
  ): Promise<AnalyticsTaskEntity> {
    return this.analyticsService.findOne(id, user.sub);
  }

  @Query(() => [AnalyticsTaskEntity], {
    description: 'Получение всех задач аналитики с фильтрами',
  })
  analyticsTasks(
    @CurrentUser() user: JwtPayload,
    @Args('filter', {
      nullable: true,
      description: 'Фильтры для поиска задач',
    })
    filter?: AnalyticsFilterInput,
  ): Promise<AnalyticsTaskEntity[]> {
    return this.analyticsService.findAll(user.sub, filter);
  }

  @Query(() => [AnalyticsTaskEntity], {
    description: 'Получение активных задач аналитики (в процессе обработки)',
  })
  activeAnalyticsJobs(
    @CurrentUser() user: JwtPayload,
  ): Promise<AnalyticsTaskEntity[]> {
    return this.analyticsService.getActiveJobs(user.sub);
  }

  @Mutation(() => AnalyticsTaskEntity, {
    description: 'Повторная обработка задачи аналитики',
  })
  refreshAnalytics(
    @CurrentUser() user: JwtPayload,
    @Args('id', { description: 'Идентификатор задачи' }) id: string,
  ): Promise<AnalyticsTaskEntity> {
    return this.analyticsService.refreshTask(id, user.sub);
  }
}




