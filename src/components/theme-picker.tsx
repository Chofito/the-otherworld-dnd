import Link from 'next/link';
import { updateSiteThemeAction } from '@/app/actions';
import { ActionForm } from '@/components/action-form';
import { ThemeEmblem } from '@/components/theme-emblem';
import {
  DESIGN_THEMES,
  type DesignTheme,
  type DesignThemeId,
} from '@/config/design-themes';
import type { Dictionary } from '@/i18n/types';

type Props = {
  current: DesignThemeId;
  labels: Dictionary['theme'];
};

/**
 * Each option is its own `data-theme` scope, so the preview inside it is
 * painted with that theme's tokens and fonts, whatever the page theme is.
 */
export function ThemePicker({ current, labels }: Props) {
  return (
    <ActionForm action={updateSiteThemeAction} className="stack">
      <fieldset className="theme-picker">
        <legend className="sr-only">{labels.legend}</legend>
        {DESIGN_THEMES.map((theme) => (
          <label key={theme.id} className="theme-option" data-theme={theme.id}>
            <input
              type="radio"
              name="theme"
              value={theme.id}
              defaultChecked={theme.id === current}
              className="theme-option__input"
            />
            <ThemePreview theme={theme} />
            <span className="theme-option__body">
              <span className="theme-option__name">
                {labels.names[theme.id].name}
                {theme.id === current ? (
                  <span className="theme-option__current">
                    {labels.current}
                  </span>
                ) : null}
              </span>
              <span className="theme-option__pitch">
                {labels.names[theme.id].pitch}
              </span>
              <span className="theme-option__swatches" aria-hidden="true">
                {Object.values(theme.swatches).map((color) => (
                  <span key={color} style={{ background: color }} />
                ))}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      <div className="row">
        <button type="submit" className="btn">
          {labels.apply}
        </button>
        <Link href="/design">{labels.labLink}</Link>
      </div>
    </ActionForm>
  );
}

function ThemePreview({ theme }: { theme: DesignTheme }) {
  return (
    <span className="theme-option__stage" aria-hidden="true">
      <span className="theme-option__door">
        {theme.id === 'arcane' ? (
          <span className="theme-option__sigil" />
        ) : (
          <ThemeEmblem theme={theme.id} idPrefix={`picker-${theme.id}`} />
        )}
      </span>
      <span className="theme-option__title">The Otherworld</span>
    </span>
  );
}
