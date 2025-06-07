import { Module } from '@nestjs/common'; // forwardRef removed as it's not used
import { FirebaseService } from './firebase.service';

@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}