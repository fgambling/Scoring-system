import * as mongoose from 'mongoose';

// export const databaseProviders = [
//   {
//     provide: 'DATABASE_CONNECTION',
//     useFactory: (): Promise<typeof mongoose> =>
//       mongoose.connect(
//         'mongodb+srv://ttscoring:F6bvfX3kMcatckhE@cluster0.lzx96l6.mongodb.net/scoring-system?retryWrites=true&w=majority&appName=Cluster0',
//       ),
//   },
// ];

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose
        .connect(
          'mongodb+srv://ttscoring:F6bvfX3kMcatckhE@cluster0.lzx96l6.mongodb.net/scoring-system?retryWrites=true&w=majority&appName=Cluster0',
        )
        .then(() => {
          console.log('mongodb connected');
          return mongoose;
        }),
  },
];
