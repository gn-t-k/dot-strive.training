import { Button } from "app/ui/button";
import { Main } from "app/ui/main";
import { Section } from "app/ui/section";
import { Skeleton } from "app/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "app/ui/tabs";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import type { FC } from "react";

export const ExercisePageLoading: FC = () => {
  return (
    <Main>
      <Section>
        <header className="flex justify-between">
          <div className="flex flex-col gap-2 w-full">
            <Skeleton className="h-[44px]" />
            <ul className="flex">
              {Array.from({ length: 3 }).map((_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: 問題ないため
                <li className="mr-1" key={index}>
                  <Skeleton className="w-[80px] h-[26px] px-2.5 py-0.5 rounded-full" />
                </li>
              ))}
            </ul>
          </div>
          <Button size="icon" variant="ghost">
            <Pencil className="size-4" />
          </Button>
        </header>
      </Section>
      <Section>
        <header className="flex items-center justify-between">
          <Skeleton className="h-[40px] w-full" />
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost">
              <ChevronLeft className="size-4" />
            </Button>
            <Button size="icon" variant="ghost">
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </header>
        <Tabs defaultValue="volume">
          <TabsList className="w-full">
            <TabsTrigger className="w-full" value="volume">
              ボリューム
            </TabsTrigger>
            <TabsTrigger className="w-full" value="maximum-weight">
              最大重量
            </TabsTrigger>
          </TabsList>
          <TabsContent value="volume">
            <Skeleton className="h-[300px]" />
          </TabsContent>
          <TabsContent value="maximum-weight">
            <Skeleton className="h-[300px]" />
          </TabsContent>
        </Tabs>
      </Section>
      <Section>
        <Button variant="destructive">種目を削除する</Button>
      </Section>
    </Main>
  );
};
