'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FilePlus, List, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { isMyGovAdmin, isSuperAdmin } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const router = useRouter()
  const [hasAccess, setHasAccess] = useState(false)
  const [isSuper, setIsSuper] = useState(false)

  useEffect(() => {
    if (!isMyGovAdmin()) {
      router.push('/login')
    } else {
      setHasAccess(true)
      setIsSuper(isSuperAdmin())
    }
  }, [router])

  if (!hasAccess) {
    return null
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Панель управления MyGov</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Система управления генерацией государственных документов
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => router.push('/documents/create')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Создать документ
              </CardTitle>
              <FilePlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Новый документ</div>
              <p className="text-xs text-muted-foreground">
                Перейти к форме создания
              </p>
            </CardContent>
          </Card>

          <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => router.push('/documents')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Список документов
              </CardTitle>
              <List className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Все документы</div>
              <p className="text-xs text-muted-foreground">
                Просмотр и управление
              </p>
            </CardContent>
          </Card>

          {isSuper && (
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => router.push('/admin/users')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Пользователи
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Администраторы</div>
                <p className="text-xs text-muted-foreground">
                  Управление доступом
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Предупреждение о незаконном использовании */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-amber-900">
                  ⚠️ Предупреждение о незаконном использовании
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
                  Данная система предназначена исключительно для законных целей. Использование системы для создания поддельных документов, мошенничества или любых других незаконных действий строго запрещено. Администрация не несет ответственности за нарушения закона, совершенные пользователями системы. Все действия пользователей логируются и могут быть использованы в качестве доказательств при расследовании правонарушений.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
