import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import {withPayload} from '@payloadcms/next/withPayload';

const nextConfig: NextConfig = {};

const withNextIntl = createNextIntlPlugin();

export default withPayload(withNextIntl(nextConfig));
