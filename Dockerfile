FROM public.ecr.aws/lambda/nodejs:18 as builder
WORKDIR /usr/app
COPY package.json ./
COPY tsconfig.json ./
RUN npm install
COPY src src
RUN npm run build
    

FROM public.ecr.aws/lambda/nodejs:18

WORKDIR ${LAMBDA_TASK_ROOT}
COPY --from=builder /usr/app/dist/* ./
RUN ls -la -R
RUN cat index.js
CMD ["index.handler"]
