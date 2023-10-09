<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "form">
      <main class="fr-pt-md-14v" role="main" id="content">
    <div class="fr-container fr-container--fluid fr-mb-md-14v">
        <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
            <div class="fr-col-12 fr-col-md-8 fr-col-lg-6">
                <h1>Connexion à Camino</h1>
                <div class="fr-container fr-background-alt--grey fr-px-md-0 fr-py-10v fr-py-md-14v">
                    <div class="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
                        <div class="fr-col-12 fr-col-md-9 fr-col-lg-8">
                            <div>
                                <form id="login-1760" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                                    <fieldset class="fr-fieldset" id="login-1760-fieldset" aria-labelledby="login-1760-fieldset-legend">
                                        <legend class="fr-fieldset__legend" id="login-1760-fieldset-legend">
                                            <h2>Se connecter avec son compte</h2>
                                        </legend>
                                        <div class="fr-fieldset__element">
                                        <#if messagesPerField.existsError('username','password')>
                                            <div class="fr-alert fr-alert--error fr-mb-3w">
                                                <h3 class="fr-alert__title">${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}</h3>
                                            </div>
                                        </#if>
                                            <fieldset class="fr-fieldset" id="credentials">                                                
                                                <div class="fr-fieldset__element">
                                                    <div class="fr-input-group">
                                                        <label class="fr-label" for="username-1757">
                                                            ${msg("email")}
                                                            <span class="fr-hint-text">Format attendu : nom@domaine.fr</span>
                                                        </label>
                                                        <input tabindex="1" autofocus class="fr-input" autocomplete="username" aria-required="true" name="username" id="username-1757" type="text"  value="${(login.username!'')}" aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>">
             
                                                       
                                                    </div>
                                                </div>
                                                <div class="fr-fieldset__element">
                                                    <div class="fr-password" id="password-1758">
                                                        <label class="fr-label" for="password-1758-input">
                                                            Mot de passe
                                                        </label>
                                                        <div class="fr-input-wrap">
                                                            <input tabindex="2" class="fr-password__input fr-input" aria-required="true" name="password" autocomplete="current-password" id="password-1758-input" type="password" aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>">
                                                        </div>
                                                        <p>
                                                            <a tabindex="4" href="${url.loginResetCredentialsUrl}" class="fr-link">${msg("doForgotPassword")}</a>
                                                        </p>
                                                    </div>
                                                </div>
                                            </fieldset>
                                        </div>
                                        <div class="fr-fieldset__element">
                                            <ul class="fr-btns-group">
                                                <li>
                                                    <button tabindex="3" class="fr-mt-2v fr-btn" name="login" type="submit">
                                                        Se connecter
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                    </fieldset>
                                </form>
                            </div>
                            <#if social.providers??>
                                <div class="${properties.kcFormSocialAccountSectionClass!} fr-mb-3w">
                                    <p class="fr-hr-or">ou</p>
                                    <h3>Se connecter avec Cerbère</h3>

                                    <#list social.providers as p>
                                        <a title="Se connecter avec Cerbère - Lien externe" id="social-${p.alias}" class="fr-link fr-link--lg fr-link--icon-right fr-icon-external-link-line fr-grid-row--right" rel="noopener"
                                                href="${p.loginUrl}">${p.displayName!}</a>
                                    </#list>
                                </div>
                            </#if>

                            <hr>
                            <h2>Vous n’avez pas de compte ?</h2>
                            <ul class="fr-btns-group">
                                <li>
                                    <a tabindex="6" class="fr-btn fr-btn--secondary"
                                                 href="${url.registrationUrl}">${msg("doRegister")}</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</main>
    </#if>

</@layout.registrationLayout>
