'use client'

import { FlowEdge } from '../FlowEdge';
import Constellations from '@/components/ui/constellations/Constellations';
import styles from './ParallaxContainer.module.css';

interface ParallaxContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function ParallaxContainer({ children, className }: ParallaxContainerProps) {
  return (
    <div className={`${styles.parallaxWrapper} ${className}`}>

      <div className={`${styles.parallaxLayer} ${styles.stars} h-[80dvh]`}>
        <Constellations />
      </div>

      <div className={`${styles.backgroundWrap}`}>
        <div className={`${styles.parallaxLayer} ${styles.background}`}></div>
      </div>
      
      <div className={`${styles.parallaxLayer} ${styles.layer1}`}>
        <FlowEdge 
          height={200}
          amplitude={13}
          wavelength={200}
          edgeColor='#8b2c8b'
          startColor='#4a0e4e'
          endColor='#1a0033'
        />
      </div>
      
      <div className={`${styles.parallaxLayer} ${styles.layer2}`}>
        <FlowEdge 
          height={150}
          amplitude={12}
          wavelength={200}
          edgeColor='#8b2c8b'
          startColor='#4a0e4e'
          endColor='#1a0033'
        />
      </div>

      <div className={`${styles.parallaxLayer} ${styles.layer3}`}>
        <FlowEdge 
          height={350}
          amplitude={10}
          wavelength={200}
          edgeColor='#8b2c8b'
          startColor='#4a0e4e'
          endColor='#1a0033'
        />
        <div className='h-[75em] w-full -mt-4 bg-[#1a0033] z-0' />
      </div>
      
      <div className={`${styles.content} flex flex-1 flex-col items-center min-h-screen`}>
        {children}
      </div>
    </div>
  );
}
