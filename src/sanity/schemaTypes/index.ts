import { memberDiscount } from './memberDiscount';
import { article } from './article';
import { job } from './job';
import { faqBlock } from './objects/faqBlock';
import { seo } from './objects/seo';
import { tableBlock } from './objects/tableBlock';
import { workshop } from './workshop';
import { workshopSeries } from './workshopSeries';

export const schemaTypes = [memberDiscount, article, workshop, workshopSeries, job, seo, tableBlock, faqBlock];
