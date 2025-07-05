"use client";

import MapDirections from '@/components/DirectionMap';
import { useParams } from 'next/navigation';

const Directions = () => {
  const params = useParams();
  const userId = params?.userId as string;

  if (!userId) return <div className="text-white p-4">User ID missing from URL</div>;

  return (
    <div className="h-screen">
      <MapDirections userId={userId} />
    </div>
  );
};

export default Directions;
