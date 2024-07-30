import { SetMetadata } from '@nestjs/common';

export const jwtConstants = {
  secret:
    'asfhuoqwncjwqhcuowqhdwqlhden2o1h4321uobfskjfbskabfhasdbasdnjobOFSAJF',
};

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
