import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spacer,
  Image,
} from '@nextui-org/react';
import Navigation from './components/navigation';

export default function Home() {
  return (
    <div className="flex h-screen flex-col">
      <Navigation />
      <div className="bg-default text-foreground flex flex-row items-center justify-center flex-grow space-x-24">
        <Image src="/main.png" />
        <div className="flex flex-col items-center justify-center space-y-8">
          <h1 className="text-7xl font-bold">CodePilot</h1>
          <p className="text-3xl">Discover the joy of problem solving</p>
        </div>
      </div>
    </div>
  );
}
