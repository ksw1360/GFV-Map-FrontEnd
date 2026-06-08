'use client';

import { use, useState, useEffect } from 'react';
import StoreTabs from '@/components/owner/StoreTabs';
import MenuCard, { Menu } from '@/components/owner/MenuCard';
import AddMenuModal from '@/components/owner/AddMenuModal';
import { getMenus, deleteMenu, updateMenu } from '@/libs/api/restaurant';

export default function MenuPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [menus, setMenus] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    type MenuApiResponse = {
        menuId: number;
        name: string;
        description?: string;
        imageUrl?: string;
    };

    type Menu = {
        id: string; // UI용 통일 ID
        restaurantId: number;
        name: string;
        description: string;
        thumbnail: string;
    };

    useEffect(() => {
        getMenus(Number(id))
            .then((data) =>
                setMenus(
                    data.map((m: MenuApiResponse) => ({
                        id: String(m.menuId),   // ✅ 여기 핵심
                        restaurantId: Number(id),
                        name: m.name,
                        description: m.description ?? '',
                        thumbnail: m.imageUrl ?? '',
                    }))
                )
            )
            .catch((e) => console.error('메뉴 불러오기 실패', e))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div className="max-w-lg mx-auto">
            <StoreTabs storeId={id} />
            <p className="text-center text-sm text-gray-400 py-10">로딩 중...</p>
        </div>
    );

    return (
        <div className="max-w-lg mx-auto">
            <StoreTabs storeId={id} />

            <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-semibold text-gray-900">메뉴</h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-xl"
                    >
                        +
                    </button>
                </div>

                <ul className="flex flex-col divide-y divide-gray-100">
                    {menus.map((menu) => (
                        <MenuCard
                            key={menu.id}   // 이제 안전 (String(menuId))
                            menu={menu}
                            onDelete={async (menuId) => {
                                console.log('삭제 시도 menuId:', menuId); // 여기서 값 확인
                                try {
                                    await deleteMenu(Number(menuId));
                                    setMenus((prev) => prev.filter((m) => m.id !== String(menuId)));
                                } catch (e) {
                                    console.error('메뉴 삭제 실패', e);
                                }
                            }}
                            onEdit={async (updatedMenu) => {
                                const saved = await updateMenu(Number(updatedMenu.id), {
                                    name: updatedMenu.name,
                                    description: updatedMenu.description,
                                    imageUrl: updatedMenu.thumbnail,
                                });
                                setMenus((prev) => prev.map((m) => m.id === updatedMenu.id ? {
                                    ...m,
                                    name: saved.name,
                                    description: saved.description,
                                    thumbnail: saved.imageUrl ?? '',
                                } : m));
                            }}
                        />
                    ))}
                </ul>
            </div>

            {showAddModal && (
                <AddMenuModal
                    restaurantId={Number(id)}
                    onClose={() => setShowAddModal(false)}
                    onAdd={(newMenu) => setMenus((prev) => [...prev, newMenu])}
                />
            )}
        </div>
    );
}