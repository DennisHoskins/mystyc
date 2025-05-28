import { Module } from '@nestjs/common'; // forwardRef removed as it's not used
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';

@Module({
  controllers: [FirebaseController],
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}