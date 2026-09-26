'use client';
import { NextStudio } from 'next-sanity/studio';
import config from '../../../sanity.config';
const stagingConfig = { ...config, basePath: '/studio', title: 'DiasporaSpot · Staging review' };
export default function StagingStudio() { return <NextStudio config={stagingConfig} />; }
